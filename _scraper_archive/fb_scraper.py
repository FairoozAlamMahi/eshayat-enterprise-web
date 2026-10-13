#!/usr/bin/env python3
"""
Deep Facebook Page Scraper (Playwright + SSR JSON <script> + GraphQL XHR + DOM)
Scrapes:
  - Company Profile / Intro / Bio / Contact Info / Address / Phone / Email / Category
  - All Timeline Posts (full expanded text, post URLs, timestamps, reactions, comments)
  - Comments & Replies on posts
  - Reviews / Recommendations (/reviews)
  - About sub-tabs (/about, /about_contact_and_basic_info, /about_profile_transparency)
  - Photos (/photos, /photos_by, /photos_albums)
  - Videos & Reels (/videos, /reels)
  - Downloads all unique high-resolution images organized into folders:
      - images/branding/ (profile picture, cover photo)
      - images/posts/    (post attachments)
      - images/gallery/  (all other page photos)
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, parse_qs

import requests
from playwright.sync_api import sync_playwright, Page, Response

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def clean_fb_url(url: str) -> str:
    parsed = urlparse(url)
    if "profile.php" in parsed.path:
        qs = parse_qs(parsed.query)
        if "id" in qs:
            return f"https://www.facebook.com/profile.php?id={qs['id'][0]}"
    parts = [p for p in parsed.path.split("/") if p]
    if parts:
        return f"https://www.facebook.com/{parts[0]}"
    return url.rstrip("/")


def is_valid_content_image(url: str) -> bool:
    if not url or not isinstance(url, str) or not url.startswith("http"):
        return False
    if "scontent" not in url and "fbcdn.net" not in url:
        return False
    lower = url.lower()
    skip_tokens = [
        "rsrc.php",
        "emoji.php",
        "/cp0/",
        "p16x16",
        "p24x24",
        "p32x32",
        "p36x36",
        "p40x40",
        "p48x48",
        "p50x50",
        "p60x60",
        "s16x16",
        "s24x24",
        "s32x32",
        "s36x36",
        "s40x40",
        "s48x48",
        "s50x50",
        "s60x60",
        "static.xx.fbcdn.net",
    ]
    return not any(tok in lower for tok in skip_tokens)


def image_base_key(url: str) -> str:
    """Use Facebook's numeric asset filename (e.g. 462541234_1234567_n.jpg) to deduplicate resolutions."""
    parsed = urlparse(url)
    fname = os.path.basename(parsed.path)
    if fname and "." in fname:
        return fname
    return hashlib.md5(url.encode("utf-8")).hexdigest() + ".jpg"


class GraphQLCollector:
    """Collects structured posts, comments, page metadata, and high-res images from Facebook Relay/GraphQL JSON."""

    def __init__(self):
        self.images: dict[str, dict] = {}
        self.posts: dict[str, dict] = {}
        self.comments: dict[str, dict] = {}
        self.page_metadata: dict[str, any] = {
            "names": set(),
            "categories": set(),
            "bios": set(),
            "phones": set(),
            "emails": set(),
            "addresses": set(),
            "websites": set(),
            "followers_text": set(),
            "info_lines": set(),
        }

    def add_image(self, url: str, width: int = 0, height: int = 0, category: str = "gallery", alt: str = ""):
        if not is_valid_content_image(url):
            return
        key = image_base_key(url)
        score = (width or 300) * (height or 300)
        # Prefer non-cropped / higher resolution URLs
        if "stp=" not in url:
            score += 500_000
        prev = self.images.get(key)
        if not prev or score > prev["score"]:
            self.images[key] = {
                "key": key,
                "url": url,
                "width": width or (prev["width"] if prev else 0),
                "height": height or (prev["height"] if prev else 0),
                "score": score,
                "category": prev["category"] if (prev and prev["category"] in ("branding", "posts")) else category,
                "alt": alt or (prev["alt"] if prev else ""),
            }

    def parse_json_tree(self, obj, context_hint: str = "gallery"):
        if isinstance(obj, dict):
            typename = obj.get("__typename", "")

            # 1. Check for image URI objects
            uri = obj.get("uri")
            width = obj.get("width", 0)
            height = obj.get("height", 0)
            if isinstance(uri, str) and is_valid_content_image(uri):
                if (isinstance(width, int) and width >= 150) or (width == 0 and height == 0):
                    self.add_image(uri, width if isinstance(width, int) else 0, height if isinstance(height, int) else 0, context_hint)

            # Check for profile/cover photo fields
            for branding_field in ("profilePicLarge", "profilePicMedium", "profile_picture", "cover_photo", "imageHighOrig", "viewer_image"):
                sub = obj.get(branding_field)
                if isinstance(sub, dict) and isinstance(sub.get("uri"), str):
                    self.add_image(
                        sub["uri"],
                        sub.get("width", 1000) or 1000,
                        sub.get("height", 1000) or 1000,
                        "branding" if "profile" in branding_field or "cover" in branding_field else "posts",
                    )

            # 2. Check for Story / Post / Photo nodes
            if (
                typename in ("Story", "Photo")
                or ("comet_sections" in obj)
                or ("creation_story" in obj)
                or ("message" in obj and ("creation_time" in obj or "id" in obj or "post_id" in obj))
            ):
                self._extract_story_node(obj)

            # 3. Check for Comment nodes
            if typename == "Comment" or ("body" in obj and "author" in obj and "created_time" in obj):
                self._extract_comment_node(obj)

            # 4. Check for Timeline / About strings (e.g. context_item, profile_tile_section)
            if "timeline_context_list_item_type" in obj or typename.startswith("ProfileTile") or typename == "User" or typename == "Page":
                self._extract_page_meta_node(obj)

            # Generic text check for phone/email/address patterns in structured text nodes
            text_val = obj.get("text")
            if isinstance(text_val, str) and 3 <= len(text_val) <= 600:
                self._check_meta_string(text_val)

            for k, v in obj.items():
                next_hint = "branding" if k in ("cover_photo", "profile_picture", "profilePicLarge") else context_hint
                self.parse_json_tree(v, next_hint)

        elif isinstance(obj, list):
            for item in obj:
                self.parse_json_tree(item, context_hint)

    def _check_meta_string(self, s: str):
        s_clean = s.strip()
        # Email detection
        for email in re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", s_clean):
            self.page_metadata["emails"].add(email.lower())
        # Bangladesh phone number detection
        for phone in re.findall(r"(?:\+?880|0)1[3-9]\d[\s-]?\d{6,8}", s_clean):
            self.page_metadata["phones"].add(phone.strip())
        if any(k in s_clean.lower() for k in ["mirpur", "shewrapara", "dhaka", "kafrul", "followers", "likes", "rating", "reviews", "eshayat"]):
            if len(s_clean) < 300:
                self.page_metadata["info_lines"].add(s_clean)

    def _extract_page_meta_node(self, obj: dict):
        name = obj.get("name")
        if isinstance(name, str) and "eshayat" in name.lower():
            self.page_metadata["names"].add(name)
        cat = obj.get("category_name") or obj.get("category")
        if isinstance(cat, str):
            self.page_metadata["categories"].add(cat)
        bio = obj.get("bio_text") or obj.get("best_description")
        if isinstance(bio, dict) and isinstance(bio.get("text"), str):
            self.page_metadata["bios"].add(bio["text"])

    def _extract_story_node(self, obj: dict):
        # Try to find message text, creation_time, post_id, url, attachments
        msg_text = ""
        if isinstance(obj.get("message"), dict) and isinstance(obj["message"].get("text"), str):
            msg_text = obj["message"]["text"].strip()

        # Sometimes inside comet_sections -> content -> story -> message
        cs = obj.get("comet_sections")
        creation_time = obj.get("creation_time") or obj.get("publish_time")
        post_id = str(obj.get("post_id") or obj.get("id") or "")
        permalink = obj.get("wwwURL") or obj.get("url") or ""

        if isinstance(cs, dict):
            content_story = cs.get("content", {}).get("story", {}) if isinstance(cs.get("content"), dict) else {}
            if isinstance(content_story, dict):
                if not msg_text and isinstance(content_story.get("message"), dict):
                    msg_text = (content_story["message"].get("text") or "").strip()
                if not permalink and isinstance(content_story.get("wwwURL"), str):
                    permalink = content_story["wwwURL"]
                if not post_id and content_story.get("post_id"):
                    post_id = str(content_story.get("post_id"))

            # Check timestamp in context_layout -> story -> comet_sections -> metadata
            ctx_story = cs.get("context_layout", {}).get("story", {}) if isinstance(cs.get("context_layout"), dict) else {}
            if isinstance(ctx_story, dict):
                meta_list = ctx_story.get("comet_sections", {}).get("metadata", []) if isinstance(ctx_story.get("comet_sections"), dict) else []
                if isinstance(meta_list, list):
                    for m in meta_list:
                        if isinstance(m, dict) and isinstance(m.get("story"), dict):
                            st = m["story"]
                            if not creation_time and st.get("creation_time"):
                                creation_time = st.get("creation_time")
                            if not permalink and isinstance(st.get("url"), str):
                                permalink = st.get("url")

        # Collect any image URIs inside this story node
        story_imgs: dict[str, dict] = {}
        self._collect_node_images(obj, story_imgs)
        for img_info in story_imgs.values():
            self.add_image(img_info["url"], img_info["width"], img_info["height"], "posts")

        if not msg_text and not story_imgs:
            return

        # Also check if creation_story has message text (for Photo nodes)
        if not msg_text and isinstance(obj.get("creation_story"), dict):
            cs_node = obj["creation_story"]
            if isinstance(cs_node.get("message"), dict) and isinstance(cs_node["message"].get("text"), str):
                msg_text = cs_node["message"]["text"].strip()

        sig_key = permalink or (msg_text[:160] if msg_text else post_id)
        if not sig_key:
            return
        sig = hashlib.md5(sig_key.encode("utf-8")).hexdigest()

        iso_date = ""
        if isinstance(creation_time, (int, float)) and creation_time > 1_000_000_000:
            iso_date = datetime.fromtimestamp(creation_time, tz=timezone.utc).isoformat()

        existing = self.posts.get(sig, {
            "post_id": post_id,
            "post_url": permalink,
            "timestamp": creation_time,
            "date_iso": iso_date,
            "text": msg_text,
            "image_keys": [],
            "comments": [],
        })
        if len(msg_text) > len(existing["text"]):
            existing["text"] = msg_text
        if permalink and not existing["post_url"]:
            existing["post_url"] = permalink
        if creation_time and not existing["timestamp"]:
            existing["timestamp"] = creation_time
            existing["date_iso"] = iso_date
        for k in story_imgs:
            if k not in existing["image_keys"]:
                existing["image_keys"].append(k)

        self.posts[sig] = existing

    def _collect_node_images(self, obj, out: dict):
        if isinstance(obj, dict):
            uri = obj.get("uri")
            w = obj.get("width", 0)
            h = obj.get("height", 0)
            if isinstance(uri, str) and is_valid_content_image(uri):
                if (isinstance(w, int) and w >= 180) or (w == 0 and h == 0):
                    k = image_base_key(uri)
                    score = (w or 300) * (h or 300)
                    if k not in out or score > out[k]["score"]:
                        out[k] = {"url": uri, "width": w if isinstance(w, int) else 0, "height": h if isinstance(h, int) else 0, "score": score}
            for v in obj.values():
                self._collect_node_images(v, out)
        elif isinstance(obj, list):
            for item in obj:
                self._collect_node_images(item, out)

    def _extract_comment_node(self, obj: dict):
        body = obj.get("body")
        text = body.get("text", "").strip() if isinstance(body, dict) else ""
        if not text:
            return
        author_obj = obj.get("author")
        author = author_obj.get("name", "") if isinstance(author_obj, dict) else ""
        created = obj.get("created_time")
        cid = str(obj.get("id") or hashlib.md5(f"{author}:{text}".encode("utf-8")).hexdigest())
        self.comments[cid] = {
            "id": cid,
            "author": author,
            "text": text,
            "created_time": created,
            "date_iso": datetime.fromtimestamp(created, tz=timezone.utc).isoformat()
            if isinstance(created, (int, float)) and created > 1_000_000_000
            else "",
        }


def extract_ssr_script_json(page: Page, collector: GraphQLCollector, context_hint: str = "gallery"):
    """Parse all <script type="application/json"> tags embedded in the initial HTML."""
    try:
        scripts = page.evaluate(
            """() => {
                return Array.from(document.querySelectorAll('script[type="application/json"]'))
                    .map(s => s.textContent || '')
                    .filter(t => t.length > 20);
            }"""
        )
        for raw in scripts:
            try:
                data = json.loads(raw)
                collector.parse_json_tree(data, context_hint)
            except Exception:
                pass
    except Exception:
        pass


def dismiss_login_popup(page: Page):
    """Dismiss Facebook's unauthenticated login modal/banner if visible."""
    try:
        page.evaluate(
            """() => {
                // Click Close button on any dialog
                const closeBtns = document.querySelectorAll('div[role="dialog"] [aria-label="Close"], div[role="dialog"] [aria-label="关闭"]');
                closeBtns.forEach(b => { try { b.click(); } catch (e) {} });

                // Also hide fixed overlay login banners that block scrolling
                document.querySelectorAll('div[role="dialog"]').forEach(d => {
                    if ((d.innerText || '').includes('Log in') || (d.innerText || '').includes('See more on Facebook')) {
                        d.style.display = 'none';
                    }
                });
            }"""
        )
    except Exception:
        pass


def expand_posts_and_comments(page: Page):
    """Click 'See more', 'View more comments', 'View all comments' buttons."""
    try:
        page.evaluate(
            """() => {
                const triggers = [
                    'See more', 'See More', '查看更多',
                    'View more comments', 'View all', 'more comments', 'more replies', 'View 1 comment'
                ];
                document.querySelectorAll('div[role="button"], span[role="button"]').forEach(btn => {
                    const txt = (btn.innerText || '').trim();
                    if (triggers.some(t => txt === t || (txt.startsWith('View ') && txt.includes('comment')) || (txt.endsWith(' comments') && txt.length < 25))) {
                        try { btn.click(); } catch (e) {}
                    }
                });
            }"""
        )
    except Exception:
        pass


def extract_dom_snapshot(page: Page) -> dict:
    """Extract visible text, posts, comments, and images from the current DOM."""
    try:
        return page.evaluate(
            """() => {
                const mainEl = document.querySelector('div[role="main"]') || document.body;
                const mainText = (mainEl.innerText || '').trim();

                const articles = [];
                document.querySelectorAll('div[role="article"]').forEach(art => {
                    const label = art.getAttribute('aria-label') || '';
                    const fullText = (art.innerText || '').trim();
                    const textBlocks = [];
                    art.querySelectorAll('div[dir="auto"], span[dir="auto"]').forEach(el => {
                        const t = (el.innerText || '').trim();
                        if (t && t.length > 2 && !textBlocks.includes(t)) {
                            textBlocks.push(t);
                        }
                    });

                    const links = [];
                    art.querySelectorAll('a[href]').forEach(a => {
                        const href = a.href || '';
                        if (href.includes('/posts/') || href.includes('/photos/') || href.includes('story_fbid=') || href.includes('/videos/') || href.includes('/reel/')) {
                            const clean = href.split('?')[0];
                            if (!links.includes(clean)) links.push(clean);
                        }
                    });

                    const imgs = [];
                    art.querySelectorAll('img[src]').forEach(img => {
                        const src = img.src || '';
                        const w = img.naturalWidth || img.width || 0;
                        const h = img.naturalHeight || img.height || 0;
                        if (src.startsWith('http') && (src.includes('scontent') || src.includes('fbcdn.net'))) {
                            if ((w === 0 || w >= 80 || h >= 80) && !src.includes('emoji.php') && !src.includes('rsrc.php')) {
                                imgs.push({ url: src, width: w, height: h, alt: img.alt || '' });
                            }
                        }
                    });

                    articles.push({
                        aria_label: label,
                        links: links,
                        text_blocks: textBlocks,
                        raw_text: fullText,
                        images: imgs
                    });
                });

                const allImages = [];
                document.querySelectorAll('img[src]').forEach(img => {
                    const src = img.src || '';
                    const w = img.naturalWidth || img.width || 0;
                    const h = img.naturalHeight || img.height || 0;
                    if (src.startsWith('http') && (src.includes('scontent') || src.includes('fbcdn.net'))) {
                        if ((w === 0 || w >= 100 || h >= 100) && !src.includes('emoji.php') && !src.includes('rsrc.php')) {
                            allImages.push({ url: src, width: w, height: h, alt: img.alt || '' });
                        }
                    }
                });

                // Also check SVG <image xlink:href / href> used by Facebook for profile pictures
                document.querySelectorAll('svg image').forEach(svgImg => {
                    const href = svgImg.getAttribute('xlink:href') || svgImg.getAttribute('href') || '';
                    if (href.startsWith('http') && (href.includes('scontent') || href.includes('fbcdn.net'))) {
                        allImages.push({ url: href, width: 500, height: 500, alt: 'Profile SVG Image', is_branding: true });
                    }
                });

                const pageLinks = [];
                document.querySelectorAll('a[href]').forEach(a => {
                    const href = a.href || '';
                    if (href.includes('facebook.com') && (href.includes('/photo') || href.includes('/posts/') || href.includes('/videos/') || href.includes('/reel/'))) {
                        // Preserve fbid= if it's a /photo/?fbid= link
                        let normalized = href;
                        if (href.includes('fbid=')) {
                            const m = href.match(/fbid=(\d+)/);
                            if (m) normalized = `https://www.facebook.com/photo/?fbid=${m[1]}`;
                        } else {
                            normalized = href.split('?')[0];
                        }
                        if (!pageLinks.includes(normalized)) pageLinks.push(normalized);
                    }
                });

                return {
                    title: document.title,
                    url: location.href,
                    main_text: mainText,
                    articles: articles,
                    all_images: allImages,
                    page_links: pageLinks
                };
            }"""
        )
    except Exception:
        return {"title": "", "url": "", "main_text": "", "articles": [], "all_images": [], "page_links": []}


def download_all_images(images_dict: dict[str, dict], out_dir: Path) -> list[dict]:
    branding_dir = out_dir / "images" / "branding"
    posts_dir = out_dir / "images" / "posts"
    gallery_dir = out_dir / "images" / "gallery"
    for d in (branding_dir, posts_dir, gallery_dir):
        d.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            "Referer": "https://www.facebook.com/",
        }
    )

    downloaded = []
    items = list(images_dict.values())
    print(f"\n[+] Downloading {len(items)} unique images ...")

    for idx, info in enumerate(items, start=1):
        url = info["url"]
        cat = info.get("category", "gallery")
        target_dir = branding_dir if cat == "branding" else (posts_dir if cat == "posts" else gallery_dir)

        key = info["key"]
        ext = os.path.splitext(key)[1].lower()
        if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            ext = ".jpg"
            key = key + ext

        safe_name = f"{idx:03d}_{re.sub(r'[^a-zA-Z0-9._-]', '_', key)}"
        filepath = target_dir / safe_name

        try:
            resp = session.get(url, timeout=25)
            if resp.status_code == 200 and len(resp.content) > 800:
                filepath.write_bytes(resp.content)
                rel_path = os.path.relpath(filepath, out_dir).replace("\\", "/")
                info["local_path"] = str(filepath)
                info["relative_path"] = rel_path
                info["file_size_bytes"] = len(resp.content)
                downloaded.append(info)
                print(f"  [{idx}/{len(items)}] [OK] {rel_path} ({len(resp.content) // 1024} KB)")
            else:
                print(f"  [{idx}/{len(items)}] [SKIP] {safe_name} (HTTP {resp.status_code})")
        except Exception as e:
            print(f"  [{idx}/{len(items)}] [ERR] Error downloading {safe_name}: {e}")

    return downloaded


def run_deep_scrape(page_url: str, output_dir: Path, max_scrolls: int = 40, headless: bool = True):
    base_url = clean_fb_url(page_url)
    output_dir.mkdir(parents=True, exist_ok=True)
    raw_dir = output_dir / "raw_data"
    raw_dir.mkdir(parents=True, exist_ok=True)

    collector = GraphQLCollector()
    dom_posts_map: dict[str, dict] = {}
    dom_comments_list: list[dict] = []
    tab_snapshots: dict[str, dict] = {}

    profile_dir = output_dir / ".browser_profile"
    profile_dir.mkdir(parents=True, exist_ok=True)

    print(f"[*] Starting Deep Scrape of: {base_url}")
    print(f"[*] Saving all data into  : {output_dir}")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=headless,
            viewport={"width": 1440, "height": 960},
            locale="en-US",
            args=["--disable-blink-features=AutomationControlled"],
        )
        page = context.pages[0] if context.pages else context.new_page()

        def on_response(response: Response):
            try:
                u = response.url
                if "graphql" in u or "ajax/bulk" in u:
                    body = response.text()
                    for line in body.splitlines():
                        line = line.strip()
                        if not line:
                            continue
                        if line.startswith("for (;;);"):
                            line = line[len("for (;;);") :]
                        try:
                            data = json.loads(line)
                            collector.parse_json_tree(data, "posts")
                        except Exception:
                            pass
            except Exception:
                pass

        page.on("response", on_response)

        # ---------------------------------------------------------
        # STEP 1: Main Timeline & Posts
        # ---------------------------------------------------------
        print(f"\n[1/5] Loading Main Page & Timeline: {base_url}")
        page.goto(base_url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(4)
        dismiss_login_popup(page)
        extract_ssr_script_json(page, collector, "posts")

        # Save full-page screenshot of header
        try:
            page.screenshot(path=str(output_dir / "page_overview_screenshot.png"), full_page=False)
        except Exception:
            pass

        stagnant = 0
        prev_counts = (0, 0)
        for s in range(1, max_scrolls + 1):
            dismiss_login_popup(page)
            expand_posts_and_comments(page)
            snap = extract_dom_snapshot(page)
            if s == 1:
                tab_snapshots["timeline_top"] = snap

            for art in snap.get("articles", []):
                lbl = art.get("aria_label", "")
                if "comment by" in lbl.lower() or "reply by" in lbl.lower():
                    if art["raw_text"] not in [c["raw_text"] for c in dom_comments_list]:
                        dom_comments_list.append(art)
                    continue

                sig_src = (art["links"][0] if art["links"] else "") or " ".join(art["text_blocks"])[:160] or art["raw_text"][:160]
                if not sig_src:
                    continue
                sig = hashlib.md5(sig_src.encode("utf-8")).hexdigest()
                old = dom_posts_map.get(sig)
                if not old or len(art["raw_text"]) > len(old["raw_text"]):
                    dom_posts_map[sig] = art

                for im in art.get("images", []):
                    collector.add_image(im["url"], im.get("width", 0), im.get("height", 0), "posts", im.get("alt", ""))

            for im in snap.get("all_images", []):
                cat = "branding" if im.get("is_branding") else "gallery"
                collector.add_image(im["url"], im.get("width", 0), im.get("height", 0), cat, im.get("alt", ""))

            cur_counts = (len(dom_posts_map) + len(collector.posts), len(collector.images))
            print(
                f"  [Timeline Scroll {s}/{max_scrolls}] DOM Posts: {len(dom_posts_map)} | GraphQL Posts: {len(collector.posts)} | Unique Images: {len(collector.images)} | Comments: {len(collector.comments) + len(dom_comments_list)}"
            )

            if cur_counts == prev_counts:
                stagnant += 1
                if stagnant >= 6:
                    print("  [i] Reached end of accessible timeline posts.")
                    break
            else:
                stagnant = 0
            prev_counts = cur_counts

            page.evaluate("window.scrollBy(0, 1300)")
            time.sleep(2.2)

        tab_snapshots["timeline_bottom"] = extract_dom_snapshot(page)

        # ---------------------------------------------------------
        # STEP 2: About Tabs (Contact, Basic Info, Transparency, Details)
        # ---------------------------------------------------------
        about_tabs = [
            ("about", f"{base_url}/about"),
            ("about_contact", f"{base_url}/about_contact_and_basic_info"),
            ("about_transparency", f"{base_url}/about_profile_transparency"),
            ("about_details", f"{base_url}/about_details"),
        ]
        print("\n[2/5] Scraping About & Transparency Tabs ...")
        for tab_name, tab_url in about_tabs:
            try:
                print(f"  -> Visiting {tab_url}")
                page.goto(tab_url, wait_until="domcontentloaded", timeout=45000)
                time.sleep(3)
                dismiss_login_popup(page)
                extract_ssr_script_json(page, collector, "branding")
                snap = extract_dom_snapshot(page)
                tab_snapshots[tab_name] = snap
                for line in snap.get("main_text", "").splitlines():
                    collector._check_meta_string(line)
            except Exception as e:
                print(f"  [!] Failed {tab_name}: {e}")

        # ---------------------------------------------------------
        # STEP 3: Reviews & Mentions Tabs
        # ---------------------------------------------------------
        review_tabs = [
            ("reviews", f"{base_url}/reviews"),
            ("mentions", f"{base_url}/mentions"),
        ]
        print("\n[3/5] Scraping Reviews & Mentions Tabs ...")
        for tab_name, tab_url in review_tabs:
            try:
                print(f"  -> Visiting {tab_url}")
                page.goto(tab_url, wait_until="domcontentloaded", timeout=45000)
                time.sleep(3)
                dismiss_login_popup(page)
                extract_ssr_script_json(page, collector, "posts")
                for _ in range(4):
                    dismiss_login_popup(page)
                    expand_posts_and_comments(page)
                    page.evaluate("window.scrollBy(0, 1200)")
                    time.sleep(1.8)
                snap = extract_dom_snapshot(page)
                tab_snapshots[tab_name] = snap
            except Exception as e:
                print(f"  [!] Failed {tab_name}: {e}")

        # ---------------------------------------------------------
        # STEP 4: Photos Tabs (/photos, /photos_by, /photos_albums)
        # ---------------------------------------------------------
        photo_tabs = [
            ("photos", f"{base_url}/photos"),
            ("photos_by", f"{base_url}/photos_by"),
            ("photos_albums", f"{base_url}/photos_albums"),
        ]
        print("\n[4/5] Scraping Photos & Albums Tabs ...")
        for tab_name, tab_url in photo_tabs:
            try:
                print(f"  -> Visiting {tab_url}")
                page.goto(tab_url, wait_until="domcontentloaded", timeout=45000)
                time.sleep(3)
                dismiss_login_popup(page)
                extract_ssr_script_json(page, collector, "gallery")

                stagnant_p = 0
                last_img_c = len(collector.images)
                for p_scroll in range(1, 16):
                    dismiss_login_popup(page)
                    snap = extract_dom_snapshot(page)
                    for im in snap.get("all_images", []):
                        collector.add_image(im["url"], im.get("width", 0), im.get("height", 0), "gallery", im.get("alt", ""))
                    cur_img_c = len(collector.images)
                    print(f"    [{tab_name} scroll {p_scroll}] Total unique images: {cur_img_c}")
                    if cur_img_c == last_img_c:
                        stagnant_p += 1
                        if stagnant_p >= 4:
                            break
                    else:
                        stagnant_p = 0
                    last_img_c = cur_img_c
                    page.evaluate("window.scrollBy(0, 1400)")
                    time.sleep(2.0)

                tab_snapshots[tab_name] = extract_dom_snapshot(page)
            except Exception as e:
                print(f"  [!] Failed {tab_name}: {e}")

        # ---------------------------------------------------------
        # STEP 5: Videos & Reels Tabs
        # ---------------------------------------------------------
        video_tabs = [
            ("videos", f"{base_url}/videos"),
            ("reels", f"{base_url}/reels"),
        ]
        print("\n[5/5] Scraping Videos & Reels Tabs ...")
        for tab_name, tab_url in video_tabs:
            try:
                print(f"  -> Visiting {tab_url}")
                page.goto(tab_url, wait_until="domcontentloaded", timeout=45000)
                time.sleep(3)
                dismiss_login_popup(page)
                extract_ssr_script_json(page, collector, "gallery")
                snap = extract_dom_snapshot(page)
                tab_snapshots[tab_name] = snap
                for im in snap.get("all_images", []):
                    collector.add_image(im["url"], im.get("width", 0), im.get("height", 0), "gallery", im.get("alt", ""))
            except Exception as e:
                print(f"  [!] Failed {tab_name}: {e}")

        # ---------------------------------------------------------
        # STEP 6: Visit Individual Post/Photo Permalinks to get full-res images, captions & comments
        # ---------------------------------------------------------
        discovered_post_urls = set()
        for p_item in collector.posts.values():
            if p_item.get("post_url") and "facebook.com" in p_item["post_url"]:
                discovered_post_urls.add(p_item["post_url"])
        for d_item in dom_posts_map.values():
            for lk in d_item.get("links", []):
                if "facebook.com" in lk:
                    discovered_post_urls.add(lk)
        for snap_val in tab_snapshots.values():
            for lk in snap_val.get("page_links", []):
                if "facebook.com" in lk and not lk.endswith("/photos") and not lk.endswith("/videos") and not lk.endswith("/reels"):
                    discovered_post_urls.add(lk)

        permalink_details = []
        if discovered_post_urls:
            target_urls = sorted(discovered_post_urls)[:65]
            print(f"\n[+] Visiting {len(target_urls)} individual post/photo/reel permalinks for captions, comments & full-res images...")
            for idx, purl in enumerate(target_urls, start=1):
                try:
                    print(f"  [{idx}/{len(target_urls)}] {purl}")
                    page.goto(purl, wait_until="domcontentloaded", timeout=30000)
                    time.sleep(2.0)
                    dismiss_login_popup(page)
                    expand_posts_and_comments(page)
                    extract_ssr_script_json(page, collector, "posts")
                    snap = extract_dom_snapshot(page)
                    for im in snap.get("all_images", []):
                        collector.add_image(im["url"], im.get("width", 0), im.get("height", 0), "posts", im.get("alt", ""))
                    for art in snap.get("articles", []):
                        lbl = art.get("aria_label", "")
                        if "comment by" in lbl.lower() or "reply by" in lbl.lower():
                            if art["raw_text"] not in [c["raw_text"] for c in dom_comments_list]:
                                dom_comments_list.append(art)
                    permalink_details.append({
                        "url": purl,
                        "title": snap.get("title", ""),
                        "main_text": snap.get("main_text", ""),
                        "images": [image_base_key(im["url"]) for im in snap.get("all_images", []) if is_valid_content_image(im["url"])],
                    })
                except Exception:
                    pass

        context.close()

    # ---------------------------------------------------------
    # Download all unique images
    # ---------------------------------------------------------
    downloaded_images = download_all_images(collector.images, output_dir)
    key_to_relpath = {img["key"]: img.get("relative_path", "") for img in downloaded_images if img.get("relative_path")}

    # Merge GraphQL posts + DOM posts into a unified list
    unified_posts = []
    seen_texts = set()

    # First add GraphQL posts (which have exact timestamps and clean text)
    sorted_gql_posts = sorted(
        collector.posts.values(),
        key=lambda x: x.get("timestamp") or 0,
        reverse=True,
    )
    for gp in sorted_gql_posts:
        txt = (gp.get("text") or "").strip()
        norm = re.sub(r"\s+", " ", txt)[:120].lower()
        if norm and norm in seen_texts:
            continue
        if norm:
            seen_texts.add(norm)
        local_imgs = [key_to_relpath[k] for k in gp.get("image_keys", []) if k in key_to_relpath]
        unified_posts.append(
            {
                "source": "graphql",
                "post_id": gp.get("post_id", ""),
                "post_url": gp.get("post_url", ""),
                "date_iso": gp.get("date_iso", ""),
                "timestamp": gp.get("timestamp"),
                "text": txt,
                "local_images": local_imgs,
            }
        )

    # Next add DOM posts that weren't already in GraphQL posts
    for dp in dom_posts_map.values():
        cleaned_blocks = [
            b
            for b in dp.get("text_blocks", [])
            if b.lower() not in ("like", "comment", "share", "all reactions:", "most relevant")
        ]
        txt = "\n\n".join(cleaned_blocks).strip() or dp.get("raw_text", "").strip()
        norm = re.sub(r"\s+", " ", txt)[:120].lower()
        if norm and any(norm[:60] in st or st[:60] in norm for st in seen_texts if len(st) > 20):
            continue
        if norm:
            seen_texts.add(norm)
        local_imgs = []
        for im in dp.get("images", []):
            k = image_base_key(im["url"])
            if k in key_to_relpath and key_to_relpath[k] not in local_imgs:
                local_imgs.append(key_to_relpath[k])
        unified_posts.append(
            {
                "source": "dom",
                "post_id": "",
                "post_url": dp["links"][0] if dp.get("links") else "",
                "date_iso": "",
                "timestamp": None,
                "text": txt,
                "raw_article_text": dp.get("raw_text", ""),
                "local_images": local_imgs,
            }
        )

    # Save raw snapshots and structured JSON
    (raw_dir / "tab_snapshots.json").write_text(
        json.dumps(tab_snapshots, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (raw_dir / "permalink_details.json").write_text(
        json.dumps(permalink_details, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    company_data = {
        "company_name": "M/s. Eshayat Enterprise",
        "facebook_url": base_url,
        "scraped_at": datetime.now().isoformat(),
        "extracted_metadata": {
            "names": sorted(collector.page_metadata["names"]),
            "categories": sorted(collector.page_metadata["categories"]),
            "bios": sorted(collector.page_metadata["bios"]),
            "phones": sorted(collector.page_metadata["phones"]),
            "emails": sorted(collector.page_metadata["emails"]),
            "info_lines": sorted(collector.page_metadata["info_lines"]),
        },
        "stats": {
            "total_posts": len(unified_posts),
            "total_graphql_posts": len(collector.posts),
            "total_dom_posts": len(dom_posts_map),
            "total_permalinks_visited": len(permalink_details),
            "total_comments": len(collector.comments) + len(dom_comments_list),
            "total_images_downloaded": len(downloaded_images),
        },
        "posts": unified_posts,
        "graphql_comments": list(collector.comments.values()),
        "dom_comments": dom_comments_list,
        "about_sections": {
            k: v.get("main_text", "")
            for k, v in tab_snapshots.items()
            if k.startswith("about") or k in ("reviews", "mentions", "videos", "reels")
        },
        "images": downloaded_images,
    }

    (output_dir / "company_data.json").write_text(
        json.dumps(company_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n[OK] Saved complete JSON to: {output_dir / 'company_data.json'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="Facebook Page URL")
    parser.add_argument("--output", default="mseshayatenterprise_data", help="Output folder")
    parser.add_argument("--max-scrolls", type=int, default=35)
    parser.add_argument("--headed", action="store_true", help="Run browser visibly")
    args = parser.parse_args()

    run_deep_scrape(
        page_url=args.url,
        output_dir=Path(args.output).resolve(),
        max_scrolls=args.max_scrolls,
        headless=not args.headed,
    )
