import { NextRequest, NextResponse } from "next/server";

export const allowedOrigins = [
    "http://localhost:3000",
    "https://blogtraffic.vercel.app",
];

export function getCorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin");
    const currentOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[1];

    return {
        "Access-Control-Allow-Origin": currentOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

export function handleOptions(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(request),
    });
}
