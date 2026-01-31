import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/blog";
import { getCorsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
    return handleOptions(req);
}

export async function DELETE(
    req: NextRequest,
) {
    const corsHeaders = getCorsHeaders(req);
    try {
        const body = await req.json();
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
