import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const signatureHeader = req.headers.get("x-blog-signature");
    const timestamp = req.headers.get("x-timestamp");

    console.log(authHeader, signatureHeader, timestamp);

    if (!authHeader || !signatureHeader || !timestamp) {
      return NextResponse.json({ error: "Missing auth headers" }, { status: 401 });
    }

    // 1️⃣ Extract API token
    const apiToken = authHeader.replace("Bearer ", "").trim();

    // 2️⃣ Find website (DO NOT expose secretKey)
    console.log("api token -----------------", apiToken)

    if (!apiToken) {
      return NextResponse.json({ error: "Invalid API token" }, { status: 401 });
    }

    // 3️⃣ Prevent replay attacks (5 min window)
    const now = Date.now();
    if (Math.abs(now - Number(timestamp)) > 5 * 60 * 1000) {
      return NextResponse.json({ error: "Request expired" }, { status: 401 });
    }

    // 4️⃣ Read raw body
    const body = await req.json();
    const payloadString = JSON.stringify(body);

    // 5️⃣ Recompute signature
    const expectedSignature = crypto
      .createHmac("sha256", "db7a3f135a17fd30e969cdb527d8fe484d511624ccc018086f65015bb30da792")
      .update(payloadString + timestamp)
      .digest("hex");

    const receivedSignature = signatureHeader.replace("sha256=", "");

    // 6️⃣ Timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );

    console.log("isValid -----------------", isValid)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ✅ Request is authentic — process blog
    // save blog, publish, etc.

    return NextResponse.json({ message: "Blog accepted" }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
