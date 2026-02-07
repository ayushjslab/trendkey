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

async function validateRequest(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const signatureHeader = req.headers.get("x-blog-signature");
    const timestamp = req.headers.get("x-timestamp");

    if (!authHeader || !signatureHeader || !timestamp) {
        return { isValid: false, error: "Missing auth headers", status: 401 };
    }

    const apiToken = authHeader.replace("Bearer ", "").trim();
    if (!apiToken || apiToken !== process.env.API_TOKEN) {
        return { isValid: false, error: "Invalid API token", status: 401 };
    }

    const now = Date.now();
    if (Math.abs(now - Number(timestamp)) > 5 * 60 * 1000) {
        return { isValid: false, error: "Request expired", status: 401 };
    }

    try {
        const body = await req.json();
        const payloadString = JSON.stringify(body);

        const expectedSignature = crypto
            .createHmac("sha256", process.env.SECRET_KEY!)
            .update(payloadString + timestamp)
            .digest("hex");

        const receivedSignature = signatureHeader.replace("sha256=", "");

        const expectedBuffer = Buffer.from(expectedSignature);
        const receivedBuffer = Buffer.from(receivedSignature);

        if (expectedBuffer.length !== receivedBuffer.length) {
            return { isValid: false, error: "Invalid signature", status: 401 };
        }

        const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

        if (!isValid) {
            return { isValid: false, error: "Invalid signature", status: 401 };
        }

        return { isValid: true, body };
    } catch (error) {
        return { isValid: false, error: "Invalid request processing", status: 400 };
    }
}

export async function POST(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    const validation = await validateRequest(req);
    if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: validation.status, headers: corsHeaders });
    }

    const body = validation.body;

    try {
        await connectDB();

        const { blogId, title, content, slug, seoTitle, seoDescription, keywords, thumbnail } = body;

        if (!blogId || !title || !content || !slug) {
            return NextResponse.json(
                { error: "Missing required core fields" },
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
            thumbnail,
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

export async function PATCH(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    const validation = await validateRequest(req);
    if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: validation.status, headers: corsHeaders });
    }

    const body = validation.body;

    try {
        await connectDB();

        if (body.keywords) {
            body.keywords = normalizeKeywords(body.keywords);
        }

        const updatedBlog = await Blog.findOneAndUpdate(
            { blogId: body.blogId },
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

export async function GET(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const blogId = searchParams.get("blogId");
        const slug = searchParams.get("slug");

        if (blogId) {
            const blog = await Blog.findOne({ blogId });
            if (!blog) {
                return NextResponse.json({ error: "Blog not found" }, { status: 404, headers: corsHeaders });
            }
            return NextResponse.json(blog, { status: 200, headers: corsHeaders });
        }

        if (slug) {
            const blog = await Blog.findOne({ slug });
            if (!blog) {
                return NextResponse.json({ error: "Blog not found" }, { status: 404, headers: corsHeaders });
            }
            return NextResponse.json(blog, { status: 200, headers: corsHeaders });
        }

        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        return NextResponse.json(blogs, { status: 200, headers: corsHeaders });

    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error fetching blogs:", err);
        return NextResponse.json(
            { error: "Internal Server Error", details: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    const validation = await validateRequest(req);
    if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: validation.status, headers: corsHeaders });
    }

    const body = validation.body;

    try {
        await connectDB();
        const { blogId } = body;

        const deletedBlog = await Blog.findOneAndDelete({ blogId });

        if (!deletedBlog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { message: "Blog deleted successfully" },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error deleting blog:", err);
        return NextResponse.json(
            { error: "Internal Server Error", details: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}