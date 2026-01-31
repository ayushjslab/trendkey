import { NextRequest, NextResponse } from "next/server";
import youtubesearchapi from "youtube-search-api";

export async function GET(req: NextRequest) {
    const  query  = "ATS optimization strategies";

    const thumbnailUrl = await getSecondVideoThumbnail(query);

    return NextResponse.json({ thumbnailUrl });
}

async function getSecondVideoThumbnail(query: string) {
    const results = await youtubesearchapi.GetListByKeyword(query, false, 3,);

    if (results.items && results.items.length >= 2) {
        const videoId = results.items[1].id;

        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        console.log("2nd Video ID:", videoId);
        console.log("Thumbnail URL:", thumbnailUrl);

        return thumbnailUrl
    }

    console.log("Not enough videos found for index 2.");
    return null;
}