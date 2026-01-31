import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog";
import { getCorsHeaders, handleOptions } from "@/lib/cors";
import crypto from "crypto";

export async function OPTIONS(req: NextRequest) {
    return handleOptions(req);
}

function normalizeKeywords(keywords: any) {
    if (!keywords) return [];
    if (Array.isArray(keywords)) {
        return keywords.map((k: any) => {
            if (typeof k === "string") return { name: k, volume: 0 };
            if (typeof k === "object" && k.name) return { name: k.name, volume: k.volume || 0 };
            return null;
        }).filter(Boolean);
    }
    if (typeof keywords === "string") {
        return [{ name: keywords, volume: 0 }];
    }
    return [];
}

export async function POST(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);
    try {
        const authHeader = req.headers.get("authorization");
        const signatureHeader = req.headers.get("x-blog-signature");
        const timestamp = req.headers.get("x-timestamp");

        if (!authHeader || !signatureHeader || !timestamp) {
            return NextResponse.json({ error: "Missing auth headers" }, { status: 401 });
        }
        const apiToken = authHeader.replace("Bearer ", "").trim();

        if (!apiToken) {
            return NextResponse.json({ error: "Invalid API token" }, { status: 401 });
        }

        const now = Date.now();
        if (Math.abs(now - Number(timestamp)) > 5 * 60 * 1000) {
            return NextResponse.json({ error: "Request expired" }, { status: 401 });
        }

        const body = await req.json();
        const payloadString = JSON.stringify(body);

        const expectedSignature = crypto
            .createHmac("sha256", process.env.SECRET_KEY!)
            .update(payloadString + timestamp)
            .digest("hex");

        const receivedSignature = signatureHeader.replace("sha256=", "");

        const isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(receivedSignature)
        );

        if (!isValid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        await connectDB();

        const { blogId, title, content, slug, seoTitle, seoDescription, keywords } = body;

        if (!blogId || !title || !content || !slug || !seoTitle || !seoDescription || !keywords) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400, headers: corsHeaders }
            );
        }

        const existingBlog = await Blog.findOne({ blogId });
        if (existingBlog) {
            return NextResponse.json(
                { error: "Blog with this blogId already exists" },
                { status: 409, headers: corsHeaders }
            );
        }

        const normalizedKeywords = normalizeKeywords(keywords);

        const newBlog = await Blog.create({
            blogId,
            title,
            content,
            slug,
            seoTitle,
            seoDescription,
            keywords: normalizedKeywords,
        });

        return NextResponse.json(
            { message: "Blog added successfully", blog: newBlog },
            { status: 201, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error adding blog:", err);
        return NextResponse.json(
            { error: "Internal Server Error", details: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
