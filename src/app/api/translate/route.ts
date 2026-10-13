import { NextRequest, NextResponse } from "next/server";
import { sanitizeText } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`translate:${ip}`, 40, 5 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Translation rate limit reached." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const text = sanitizeText(body.text, 1500);
    const targetLang = body.targetLang === "en" ? "en" : "bn";
    if (!text) {
      return NextResponse.json({ translatedText: "" });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((part: unknown[]) => (Array.isArray(part) ? part[0] : ""))
          .join("");
        return NextResponse.json({ translatedText: translated });
      }
    }

    return NextResponse.json({ translatedText: text });
  } catch {
    return NextResponse.json({ translatedText: "" });
  }
}
