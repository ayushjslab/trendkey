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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ blogId: string }> }
) {
    const corsHeaders = getCorsHeaders(req);
    try {
        await connectDB();
        const { blogId } = await params;
        const body = await req.json();

        if (body.keywords) {
            body.keywords = normalizeKeywords(body.keywords);
        }

        const updatedBlog = await Blog.findOneAndUpdate(
            { blogId },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { message: "Blog updated successfully", blog: updatedBlog },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error updating blog:", err);
        return NextResponse.json(
            { error: "Internal Server Error", details: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
