#!/usr/bin/env python3
"""
Post-processes and enriches the scraped M/s. Eshayat Enterprise data:
1. Checks if any discovered /photo/?fbid= links were not yet visited, visits them to get any remaining captions.
2. Merges all GraphQL posts, Photo creation_story captions, DOM posts, and Video metadata into a single deduplicated catalog.
3. Organizes the `mseshayatenterprise_data/` directory cleanly with:
   - company_profile.json      (Complete company identity, contacts, addresses, stats, transparency info)
   - posts_and_products.json   (All deduplicated posts with full text, dates, URLs, and local image paths)
   - comments_and_reviews.json (All comments, author replies, and review status)
   - videos_catalog.json       (All 10 downloaded videos/reels with metadata & local MP4 paths)
   - FULL_COMPANY_REPORT.md    (Comprehensive Markdown master document with everything & embedded images)
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright, Response

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fb_scraper import (
    GraphQLCollector,
    dismiss_login_popup,
    expand_posts_and_comments,
    extract_ssr_script_json,
    extract_dom_snapshot,
    image_base_key,
)


def main():
    data_dir = Path("mseshayatenterprise_data").resolve()
    raw_dir = data_dir / "raw_data"
    company_json_path = data_dir / "company_data.json"

    company_data = json.loads(company_json_path.read_text(encoding="utf-8"))
    tab_snapshots = json.loads((raw_dir / "tab_snapshots.json").read_text(encoding="utf-8"))
    permalink_details = json.loads((raw_dir / "permalink_details.json").read_text(encoding="utf-8"))

    visited_urls = {item["url"] for item in permalink_details}
    all_discovered_urls = set()
    for snap in tab_snapshots.values():
        for lk in snap.get("page_links", []):
            if "facebook.com" in lk and not any(lk.endswith(x) for x in ("/photos", "/videos", "/reels", "/photos_by", "/photos_albums")):
                all_discovered_urls.add(lk)

    missing_urls = sorted(all_discovered_urls - visited_urls)
    collector = GraphQLCollector()

    if missing_urls and "--visit-missing" in sys.argv:
        print(f"[*] Visiting {len(missing_urls)} remaining photo/post URLs that were beyond the first 65 limit...")
        profile_dir = data_dir / ".browser_profile"
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=str(profile_dir),
                headless=True,
                viewport={"width": 1440, "height": 960},
                locale="en-US",
                args=["--disable-blink-features=AutomationControlled"],
            )
            page = context.pages[0] if context.pages else context.new_page()

            def on_response(response: Response):
                try:
                    if "graphql" in response.url or "ajax/bulk" in response.url:
                        for line in response.text().splitlines():
                            line = line.strip()
                            if line.startswith("for (;;);"):
                                line = line[len("for (;;);") :]
                            if line:
                                try:
                                    collector.parse_json_tree(json.loads(line), "posts")
                                except Exception:
                                    pass
                except Exception:
                    pass

            page.on("response", on_response)

            for idx, u in enumerate(missing_urls, start=1):
                try:
                    print(f"  [{idx}/{len(missing_urls)}] {u}")
                    page.goto(u, wait_until="domcontentloaded", timeout=30000)
                    time.sleep(2.0)
                    dismiss_login_popup(page)
                    expand_posts_and_comments(page)
                    extract_ssr_script_json(page, collector, "posts")
                    snap = extract_dom_snapshot(page)
                    permalink_details.append({
                        "url": u,
                        "title": snap.get("title", ""),
                        "main_text": snap.get("main_text", ""),
                    })
                except Exception as e:
                    print(f"  [!] Error on {u}: {e}")

            context.close()

    # Build map of image key -> local relative path
    images_list = company_data.get("images", [])
    key_to_rel = {img["key"]: img["relative_path"] for img in images_list if img.get("relative_path")}

    # Combine existing posts + previously saved posts_and_products.json + newly collected GraphQL posts
    all_raw_posts = list(company_data.get("posts", []))
    existing_pp_path = data_dir / "posts_and_products.json"
    if existing_pp_path.exists():
        try:
            for ep in json.loads(existing_pp_path.read_text(encoding="utf-8")):
                all_raw_posts.append({
                    "source": "graphql",
                    "post_id": ep.get("post_id", ""),
                    "post_url": ep.get("post_url", ""),
                    "date_iso": ep.get("date_iso", ""),
                    "timestamp": ep.get("timestamp"),
                    "text": (ep.get("text") or "").strip(),
                    "local_images": ep.get("images", []),
                })
        except Exception:
            pass
    for gp in collector.posts.values():
        local_imgs = [key_to_rel[k] for k in gp.get("image_keys", []) if k in key_to_rel]
        all_raw_posts.append({
            "source": "graphql",
            "post_id": gp.get("post_id", ""),
            "post_url": gp.get("post_url", ""),
            "date_iso": gp.get("date_iso", ""),
            "timestamp": gp.get("timestamp"),
            "text": (gp.get("text") or "").strip(),
            "local_images": local_imgs,
        })

    # Group and merge posts by primary content image (excluding branding logo 003_) or by post_id
    branding_img = "images/branding/003_767793945_122103034311425702_8369019421966702579_n.jpg"
    merged_by_image: dict[str, dict] = {}
    text_only_posts: list[dict] = []

    for p_item in all_raw_posts:
        txt = (p_item.get("text") or "").strip()
        # Filter out noisy DOM-only boilerplate like "M/s.Eshayat Enterprise\nAI content..."
        if p_item.get("source") == "dom" and txt.startswith("M/s.Eshayat Enterprise") and "Like\nComment" in txt and len(txt) < 150:
            txt = ""
        # Remove duplicated "See less" text if DOM expanded it twice
        if "See less" in txt:
            parts = txt.split("See less")
            txt = parts[0].strip()

        imgs = [im for im in p_item.get("local_images", []) if im != branding_img]
        if not imgs and branding_img in p_item.get("local_images", []) and "refreshed identity" in txt.lower():
            imgs = [branding_img]

        primary_img = imgs[0] if imgs else ""
        group_key = primary_img or (f"text:{txt[:100]}" if txt else "")
        if not group_key:
            continue

        existing = merged_by_image.get(group_key, {
            "post_id": "",
            "post_url": "",
            "date_iso": "",
            "timestamp": None,
            "text": "",
            "images": [],
        })

        if p_item.get("post_id") and (not existing["post_id"] or p_item["post_id"].isdigit()):
            existing["post_id"] = p_item["post_id"]
        if p_item.get("post_url") and (not existing["post_url"] or "/posts/" in p_item["post_url"]):
            existing["post_url"] = p_item["post_url"]
        if p_item.get("timestamp") and not existing["timestamp"]:
            existing["timestamp"] = p_item["timestamp"]
            existing["date_iso"] = p_item.get("date_iso", "")
        if len(txt) > len(existing["text"]):
            existing["text"] = txt
        for im in imgs:
            if im not in existing["images"]:
                existing["images"].append(im)

        merged_by_image[group_key] = existing

    # Load video metadata from videos/*.info.json
    videos_dir = data_dir / "videos"
    videos_catalog = []
    if videos_dir.exists():
        for info_file in sorted(videos_dir.glob("*.info.json")):
            try:
                vinfo = json.loads(info_file.read_text(encoding="utf-8"))
                vid_id = vinfo.get("id", info_file.stem.replace(".info", ""))
                mp4_file = videos_dir / f"{vid_id}.mp4"
                ts = vinfo.get("timestamp")
                videos_catalog.append({
                    "video_id": vid_id,
                    "title": vinfo.get("title") or vinfo.get("fulltitle") or "",
                    "description": vinfo.get("description") or "",
                    "duration_seconds": vinfo.get("duration"),
                    "view_count": vinfo.get("view_count"),
                    "upload_date": vinfo.get("upload_date"),
                    "timestamp": ts,
                    "date_iso": datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else "",
                    "webpage_url": f"https://www.facebook.com/mseshayatenterprise/videos/{vid_id}/",
                    "local_video_path": f"videos/{mp4_file.name}" if mp4_file.exists() else "",
                    "file_size_kb": (mp4_file.stat().st_size // 1024) if mp4_file.exists() else 0,
                })
            except Exception:
                pass

    videos_catalog.sort(key=lambda x: x.get("timestamp") or 0, reverse=True)

    # Enrich graphic-only poster posts with visual text transcribed directly from the high-res posters
    poster_ocr_map = {
        "images/posts/005_843533453_122123584761425702_3214594009096387549_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — STAINLESS STEEL SINTERED FILTER\n"
            "High Strength | High Filtration | Reliable Performance\n"
            "• Corrosion Resistant • High Temperature Resistant • Long Service Life • Fine Mesh Precision Filtration\n"
            "Contact: 01862679456 | Email: eshayat.enterprise@outlook.com | 1305/1, East Shewrapara, Kafrul PS, Mirpur, Dhaka-1216"
        ),
        "images/posts/002_841533061_122123273235425702_3933722959656649495_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — KMN® HEAT SEAL REEL (For Reliable & Secure Sealing)\n"
            "• Size: 300mm X 200m • Strong & Tight Seal • High Quality Material • Ideal for Sterilization & Packaging\n"
            "Suitable for Pharmaceutical, Laboratory and Industrial Packaging\n"
            "Call Now: 01862679456 | Email: eshayat.enterprise@outlook.com | 1305/1, East Shewrapara, Kafrul PS, Mirpur, Dhaka-1216"
        ),
        "images/posts/006_834249160_122122923291425702_1572646837667355227_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — 2mL Autosampler Vials with Screw Cap (Precision • Durability • Reliable Results)\n"
            "Available Brands: BKMAM® | WQS®\n"
            "• 2mL Capacity • Screw Cap (Secure & leak-proof) • High Quality Glass (Clear & amber options) • PTFE/Silicone Septa\n"
            "Specifications: Volume 2 mL | Height 32 mm | Diameter (body) 12 mm | Neck (outer) 9 mm | Screw Cap Height 9 mm | Septum Thickness 6.2 mm\n"
            "Contact: 01862679456 | Email: eshayat.enterprise@outlook.com | 1305/1, East Shewrapara, Kafrul PS, Mirpur, Dhaka"
        ),
        "images/posts/008_830985381_122122186149425702_8759497747368981778_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — AUTOCLAVE SAFETY SHOE (Safety for Every Step — Ideal for Cleanroom & Pharmaceutical Environment)\n"
            "• Autoclave Safe (Withstands high temperature sterilization) • Lightweight & Comfortable • Anti-Slip Sole • Chemical Resistant • Durable Construction\n"
            "Applications: Pharmaceutical Industries | Laboratories | Hospitals | Cleanrooms | Sterilization Units\n"
            "Contact: 01862679456 | Email: eshayat.enterprise@outlook.com | 1305/1, East Shewrapara, Kafrul, Dhaka, Bangladesh"
        ),
        "images/posts/022_789925133_122113447113425702_292862388657304041_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — BKMAM® / Labshark® PETRI DISHES (FDA • ISO • CE Certified)\n"
            "• Crystal Clear High Transparency • 100% Virgin Polystyrene • Smooth & Uniform Surface\n"
            "Available Sizes: 55mm | 90mm | 100mm | 150mm (Packing: 2000 PCS Per Carton for 55mm)\n"
            "Call: 01862 679456 | 1035/1, East Shewrapara, Mirpur, Kafrul PS, Dhaka-1216, Bangladesh"
        ),
        "images/posts/023_790317971_122113447047425702_3754475717104225991_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — BKMAM® / BKMANLAB® PETRI DISHES (FDA • ISO • CE Certified)\n"
            "• 100% Virgin Polystyrene • 90mm x 15mm Sterile • Packing: 300 PCS / Carton (10 PCS / Pack)\n"
            "Call: 01862 679456 | 1035/1, East Shewrapara, Mirpur, Kafrul PS, Dhaka-1216, Bangladesh"
        ),
        "images/posts/024_790226655_122113317051425702_98774340154925747_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — PREMIUM SAFETY HELMET (Engineered for Electric & Height Work)\n"
            "• EN 50365:2002 Electrically Insulating Helmet Class 0 (Up to 1000V AC / 1500V DC)\n"
            "• High Impact ABS Shell • 6-Point Suspension Harness with Chin Strap • Ventilated Design • Integrated Retractable Clear Visor\n"
            "• OEM & ODM Solutions (We Manufacture. You Brand. Custom Logo, Custom Colors, Custom Packaging, Low MOQ)\n"
            "Contact: +880 1887-333032 | www.eshayatenterprise.com"
        ),
        "images/posts/025_789446293_122113316985425702_753091509151483745_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — PREMIUM SAFETY HELMET (Transparent High Impact ABS Shell)\n"
            "• High Impact ABS Shell • Comfort Fit Suspension • Ventilated Design • Clear Visor Protection • Ratchet Adjustment\n"
            "• OEM & ODM Solutions (We Manufacture. You Brand. Custom Logo, Custom Colors, Custom Packaging, Low MOQ)\n"
            "Contact: +880 1887-333032 | www.eshayatenterprise.com"
        ),
        "images/posts/031_782492697_122110585443425702_4503993509866040597_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — REUSABLE HALF FACE RESPIRATOR MASK (EN 140:1998 Certified)\n"
            "• Premium Protection (Filters dust, fumes & harmful particles) • Comfortable Ergonomic Design • Reusable & Durable • Adjustable Straps\n"
            "Ideal For: Construction | Painting | Industrial | Laboratory | Daily Use\n"
            "Contact: 01886-276358 | www.eshayatenterprise.com"
        ),
        "images/posts/056_767400864_122102914989425702_5773990440345723970_n.jpg": (
            "[Poster Text] M/S Eshayat Enterprise — Essential Tools for Every Laboratory:\n"
            "1. SCHOTT DURAN Laboratory Bottle (250ml, Heat & Chemical Resistant, Autoclavable, Made in Germany)\n"
            "2. Volumetric Pipettes (5ml | 10ml | 20ml | 50ml, Class A Accuracy, Borosilicate Glass)\n"
            "3. Digital Caliper (150mm / 6\", High Precision Measurement, Digital Display, Metric & Inch Conversion, Stainless Steel)\n"
            "Contact: 01862679456 | 1035/1, East Shewrapara, Mirpur, Kafrul PS, Dhaka-1216, Bangladesh"
        ),
    }

    for item in merged_by_image.values():
        if not item.get("text") and item.get("images"):
            first_im = item["images"][0]
            if first_im in poster_ocr_map:
                item["text"] = poster_ocr_map[first_im]

    # Sort posts: posts with timestamps/text first, then by image index
    final_posts = list(merged_by_image.values())
    final_posts.sort(
        key=lambda x: (
            1 if x.get("text") else 0,
            x.get("timestamp") or 0,
            x["images"][0] if x.get("images") else "",
        ),
        reverse=True,
    )

    # Deduplicate comments
    comments_map = {}
    for c in company_data.get("graphql_comments", []) + list(collector.comments.values()):
        k = f"{c.get('author', '')}:{c.get('text', '')}:{c.get('created_time', '')}"
        comments_map[k] = c

    clean_comments = sorted(comments_map.values(), key=lambda x: x.get("created_time") or 0, reverse=True)

    # Build structured Company Profile JSON
    company_profile = {
        "official_name": "M/s. Eshayat Enterprise",
        "alternate_names": ["M/S Eshayat Enterprise", "M/s.Eshayat Enterprise", "Eshayat Enterprise"],
        "tagline": "Quality • Reliability • Trust — Your Trusted Partner for Industrial & Laboratory Solutions",
        "facebook_handle": "@mseshayatenterprise",
        "facebook_url": "https://www.facebook.com/mseshayatenterprise",
        "facebook_page_id": "1256996357495715",
        "facebook_Delegate_or_Uploader_ID": "61592771081245",
        "page_created_date": "7 August (Page Transparency)",
        "category": "Commercial and Industrial Equipment Supplier",
        "business_type": "Importer, Supplier, Wholesaler & OEM/ODM Solutions Provider for Laboratory, Industrial Safety, PPE, Cleanroom & MRO Equipment",
        "followers": "3.6K followers",
        "following": "3 following",
        "rating_and_reviews": "Not yet rated (0 reviews)",
        "operating_hours": "Always open",
        "ad_status": "This Page isn't currently running ads",
        "contact_information": {
            "phones": [
                "+880 1862-679456 (Primary Mobile / WhatsApp — listed on About tab & most posts)",
                "+880 1309-816266 (Sales / Inquiries — listed on recent posts)",
                "+880 1887-333032 (Listed on OEM/ODM Safety Helmet posters)",
                "+880 1886-276358 (Listed on EN 140:1998 Half-Face Respirator poster)",
                "+880 1630-200454 (Listed on early corporate banner post)",
            ],
            "email": "eshayat.enterprise@outlook.com",
            "website_mentioned_in_posts": "www.eshayatenterprise.com (eshayatenterprise.com)",
            "alternate_fb_mention": "facebook.com/eshayat.enterprise",
            "address_primary": "1035/1 (also written as 1305/1 on several posters), East Shewrapara, Mirpur, Kafrul PS, Dhaka-1216, Bangladesh",
        },
        "core_product_divisions": [
            {
                "division": "Laboratory Equipment, Consumables & Scientific Glassware",
                "items": [
                    "Peristaltic Pumps (Models: BT600FC & CF3000 — smart touch-screen fluid transfer)",
                    "Micropipettes (DLAB HiPette, QIUJING Adjustable 20–200 µL with 2-year warranty, Discovery-H Single-Channel 10–100 µL, 20–200 µL, 100–1000 µL, 0.5–5 mL)",
                    "Class A Volumetric Pipettes (Borosilicate glass, TD calibrated: 5 mL, 10 mL, 20 mL, 25 mL, 50 mL)",
                    "Laboratory Reagent Bottles (Schott Duran 250 mL Made in Germany; Clear & Amber borosilicate screw-cap: 30 mL, 60 mL, 100 mL, 250 mL, 500 mL, 800 mL, 1000 mL, 2000 mL)",
                    "2mL Autosampler Vials with Screw Cap (Brands: BKMAM® & WQS® — Clear & Amber glass, PTFE/Silicone Septa, 32×12mm, 9mm neck)",
                    "Petri Dishes (BKMAM® / BKMANLAB® / Labshark® — FDA, ISO, CE certified 100% virgin polystyrene: 55mm [2000 pcs/carton], 90mm [300 or 500 pcs/carton], 100mm, 150mm)",
                    "KMN® Heat Seal Reel (Size: 300mm × 200m — sterilization & packaging reel for pharmaceutical, lab & industrial use)",
                    "Stainless Steel Sintered Filters & Stainless Steel Mesh Filters (Fine mesh precision particle filtration, high-temp & corrosion resistant)",
                    "Digital Calipers (150mm / 6\" Stainless Steel, Metric & Inch conversion, digital display)",
                    "General Lab Glassware (Beakers, Flasks, Test Tubes, Measuring Cylinders, Burettes, Funnels)",
                    "Lab Accessories (Measuring & Weighing Instruments, Support & Heating Equipment, Storage & Cleaning)",
                ],
            },
            {
                "division": "Personal Protective Equipment (PPE) & Workplace Safety",
                "items": [
                    "Emergency Safety Shower & Eyewash Stations (Corrosion-resistant industrial/lab decontamination)",
                    "Autoclave Safety Shoes (Cleanroom & pharma grade, withstands high-temp autoclave sterilization, anti-slip, chemical resistant)",
                    "Industrial Safety Shoes & Boots (Steel toe cap, anti-slip, puncture protection)",
                    "1000V Electrical Safety Gloves (Blue & Green 1000V insulated, anti-slip, water-resistant)",
                    "Industrial Hand Gloves (Chemical, cut, abrasion, heat & cold protection)",
                    "Electrical Isolation Mats (High electrical insulation, anti-slip textured surface for switch/control rooms)",
                    "Protective Eyewear & Safety Goggles (1710IN Protective Eyewear — special offer BDT 550/pc; anti-splash/dust goggles)",
                    "Safety Helmets & OEM/ODM Hard Hats (EN 50365:2002 Class 0 Electrically Insulating up to 1000V AC / 1500V DC; Transparent High-Impact ABS Shell; integrated clear visor; 6-point harness; custom logo/color OEM & ODM)",
                    "High-Visibility Reflective Safety Vests (Orange & Yellow fluorescent fabric with zipper)",
                    "Full-Body Safety Harness & Shock-Absorbing Lanyards (Work at height protection)",
                    "Industrial Ear Muffs & Ear Plugs (High-noise hearing protection)",
                    "Respiratory Protection & Filters (EN 140:1998 & CE Certified Reusable Half-Face Respirator Masks; Gas/Vapour, Combined, Particulate & Pre-filters)",
                ],
            },
            {
                "division": "Fire Safety & Emergency Equipment",
                "items": [
                    "Fire Extinguishers",
                    "Fire Blankets & Fire Cabinets",
                    "Fire Alarms, Smoke Detectors, Emergency Lights & Fire Exit Signs",
                    "Fire Fighting Suits, Helmets, Gloves & Boots",
                    "Fire Hose, Hose Reels, Hydrant Systems, Fire Sand Shovels, Fire Axes, Bolt Cutters & Escape Ladders",
                ],
            },
            {
                "division": "Cleanroom Design, Construction & Engineering",
                "items": [
                    "Turnkey Cleanroom Design & Engineering (for Pharma Plants, QC Labs, Microbiology Labs, Healthcare)",
                    "Modular Cleanroom Panels, Flooring, Ceiling & Lighting",
                    "HVAC & Air Handling Systems with HEPA/ULPA Filtration",
                    "Cleanroom Doors, Windows, Pass Boxes & Air Showers",
                    "Temperature, Humidity & Pressure Control Systems",
                ],
            },
            {
                "division": "MRO (Maintenance, Repair & Operations) & Industrial Batteries",
                "items": [
                    "SAFT LS 17500 3.6V Li-SOCl2 Lithium Batteries (for Smart Meters, IoT, PLC/Memory Backup, Tracking)",
                    "Hand Tools, Power Tools, Fasteners & Hardware",
                    "Lubricants, Maintenance Chemicals, Adhesives, Tapes & Sealants",
                    "Abrasives, Cutting Products, Cleaning & Janitorial Supplies",
                ],
            },
        ],
        "branding_assets": {
            "profile_logo": "images/branding/003_767793945_122103034311425702_8369019421966702579_n.jpg",
            "cover_banner": "images/branding/004_768148887_122102732217425702_1776836872297195546_n.png",
            "page_screenshot": "page_overview_screenshot.png",
        },
        "archive_statistics": {
            "unique_images_downloaded": len(images_list),
            "videos_and_reels_downloaded": len(videos_catalog),
            "unique_posts_and_photo_items": len(final_posts),
            "public_comments_captured": len(clean_comments),
            "public_reviews_count": 0,
        },
    }

    (data_dir / "company_profile.json").write_text(
        json.dumps(company_profile, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (data_dir / "posts_and_products.json").write_text(
        json.dumps(final_posts, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (data_dir / "comments_and_reviews.json").write_text(
        json.dumps(
            {
                "reviews_summary": "Not yet rated (0 reviews on Facebook /reviews tab)",
                "mentions_summary": "No public user mentions/tags on /mentions tab",
                "comments": clean_comments,
                "dom_comment_snapshots": company_data.get("dom_comments", []),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    (data_dir / "videos_catalog.json").write_text(
        json.dumps(videos_catalog, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Generate FULL_COMPANY_REPORT.md
    md = [
        "# M/s. Eshayat Enterprise — Complete Public Intelligence & Content Archive",
        "",
        f"> **Scraped From:** [https://www.facebook.com/mseshayatenterprise](https://www.facebook.com/mseshayatenterprise)  ",
        f"> **Archive Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ",
        f"> **Total Images Downloaded:** {len(images_list)} high-resolution files (`images/branding/` & `images/posts/`)  ",
        f"> **Total Videos/Reels Downloaded:** {len(videos_catalog)} MP4 videos (`videos/`)  ",
        f"> **Total Posts & Photo Records:** {len(final_posts)}  ",
        f"> **Total Public Comments Captured:** {len(clean_comments)} (Reviews: 0 — *'Not yet rated (0 reviews)'*)",
        "",
        "---",
        "",
        "## 1. Company Identity & Contact Information",
        "",
        "| Field | Value |",
        "|---|---|",
        "| **Official Name** | **M/s. Eshayat Enterprise** (also styled as *M/S Eshayat Enterprise* / *M/s.Eshayat Enterprise*) |",
        "| **Tagline / Slogan** | *Quality • Reliability • Trust — Your Trusted Partner for Industrial & Laboratory Solutions* |",
        "| **Bengali Intro** | *Industrial Safety, PPE, Laboratory Glassware, Scientific Supplies & MRO Products-এর বিশ্বস্ত সরবরাহকারী। মানসম্মত পণ্য ও নির্ভরযোগ্য সেবায় আপনার Trusted Industrial Partner — M/s. Eshayat Enterprise.* |",
        "| **Facebook URL** | `https://www.facebook.com/mseshayatenterprise` (also referenced in posts as `facebook.com/eshayat.enterprise`) |",
        "| **Facebook Page ID** | `1256996357495715` (Uploader/Delegate ID: `61592771081245`) |",
        "| **Category** | Commercial and Industrial Equipment Supplier |",
        "| **Business Role** | Importer, Supplier, Wholesaler & OEM/ODM Solutions Provider of Laboratory, Industrial Safety, Cleanroom & Technical Equipment |",
        "| **Page Creation Date** | August 7 (per Facebook Page Transparency) |",
        "| **Followers / Following** | **3.6K followers** • **3 following** |",
        "| **New Follower Shoutout** | Mergan Shuvo, Sadiq Ahmed, Obaidur Rahman Sakib, Julichia Benie, Naira Victorino Marques |",
        "| **Primary Phone / WhatsApp** | `+880 1862-679456` (`01862679456`) |",
        "| **Secondary Sales Phone** | `+880 1309-816266` (`01309816266`) |",
        "| **Additional Phones (Posters)** | `+880 1887-333032`, `+880 1886-276358`, `+880 1630-200454` |",
        "| **Email Address** | `eshayat.enterprise@outlook.com` |",
        "| **Website Mentioned** | `www.eshayatenterprise.com` (`eshayatenterprise.com`) |",
        "| **Physical Address** | `1035/1` (also written as `1305/1` in several posts), East Shewrapara, Mirpur, Kafrul PS, Dhaka-1216, Bangladesh |",
        "| **Operating Hours** | Always Open |",
        "| **Reviews / Rating** | Not yet rated (0 reviews) |",
        "| **Active Ads** | None (*'This Page isn't currently running ads'*) |",
        "",
        "### Branding Assets",
        "- **Profile Logo:** [`images/branding/003_767793945_122103034311425702_8369019421966702579_n.jpg`](images/branding/003_767793945_122103034311425702_8369019421966702579_n.jpg) (1254×1254)",
        "- **Cover Banner:** [`images/branding/004_768148887_122102732217425702_1776836872297195546_n.png`](images/branding/004_768148887_122102732217425702_1776836872297195546_n.png) (1942×809)",
        "- **Page Overview Screenshot:** [`page_overview_screenshot.png`](page_overview_screenshot.png)",
        "",
        "---",
        "",
        "## 2. Complete Product & Service Portfolio",
        "",
    ]

    for div in company_profile["core_product_divisions"]:
        md.append(f"### {div['division']}")
        for item in div["items"]:
            md.append(f"- {item}")
        md.append("")

    md.extend([
        "---",
        "",
        "## 3. Public Comments, Customer Inquiries & Reviews",
        "",
        "- **Facebook Reviews Tab (`/reviews`):** `Not yet rated (0 reviews)`",
        "- **Facebook Mentions Tab (`/mentions`):** `No posts or tags`",
        "- **Post Comments Captured:**",
        "",
        "| Date (UTC) | Author | Comment / Reply |",
        "|---|---|---|",
    ])

    for c in clean_comments:
        md.append(f"| `{c.get('date_iso', '')}` | **{c.get('author', 'User')}** | {c.get('text', '')} |")

    md.extend([
        "",
        "---",
        "",
        f"## 4. Downloaded Videos & Reels ({len(videos_catalog)} MP4s)",
        "",
        "| # | Video ID | Upload Date | Duration | Views | Title / Caption | Local File |",
        "|---|---|---|---|---|---|---|",
    ])

    for idx, v in enumerate(videos_catalog, start=1):
        t_clean = (v.get("title") or "").replace("\n", " ").replace("|", "/")
        if len(t_clean) > 80:
            t_clean = t_clean[:77] + "..."
        lpath = v.get("local_video_path", "")
        link_str = f"[`{lpath}`]({lpath}) ({v.get('file_size_kb', 0)} KB)" if lpath else "N/A"
        md.append(
            f"| {idx} | `{v.get('video_id')}` | `{v.get('upload_date') or ''}` | {v.get('duration_seconds')}s | {v.get('view_count')} | {t_clean} | {link_str} |"
        )

    md.extend([
        "",
        "---",
        "",
        f"## 5. All Scraped Posts & Photo Content ({len(final_posts)} Items)",
        "",
    ])

    for idx, post in enumerate(final_posts, start=1):
        md.append(f"### Post / Item #{idx}")
        if post.get("post_id"):
            md.append(f"- **Post/Media ID:** `{post['post_id']}`")
        if post.get("date_iso"):
            md.append(f"- **Published (UTC):** `{post['date_iso']}`")
        if post.get("post_url"):
            md.append(f"- **Permalink:** {post['post_url']}")
        if post.get("images"):
            img_links = ", ".join(f"[`{im}`]({im})" for im in post["images"])
            md.append(f"- **Local Image(s):** {img_links}")
        md.append("")
        if post.get("text"):
            md.append("```text")
            md.append(post["text"])
            md.append("```")
            md.append("")
        for im in post.get("images", []):
            md.append(f"![Post #{idx} Image]({im})")
            md.append("")
        md.append("---")
        md.append("")

    (data_dir / "FULL_COMPANY_REPORT.md").write_text("\n".join(md), encoding="utf-8")
    print(f"[OK] Generated organized files and FULL_COMPANY_REPORT.md in {data_dir}")


if __name__ == "__main__":
    main()
