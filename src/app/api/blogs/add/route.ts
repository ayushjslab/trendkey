import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog";
import { getCorsHeaders, handleOptions } from "@/lib/cors";

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
        await connectDB();
        const body = await req.json();

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
