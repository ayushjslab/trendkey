import { NextRequest, NextResponse } from 'next/server';

interface KeywordSuggestion {
    keyword: string;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // allow from anywhere
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}


// ✅ LEGAL Bing autocomplete
async function getBingSuggestions(
    keyword: string,
    country = 'US',
    market = 'en-US'
): Promise<string[]> {
    try {
        const response = await safeFetch(
            `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(
                keyword
            )}&cc=${country}&mkt=${market}`
        );

        if (!response?.ok) return [];

        const data = await response.json();
        return Array.isArray(data?.[1]) ? data[1] : [];
    } catch (error) {
        console.error('Bing fetch failed:', error);
        return [];
    }
}


// Yahoo Suggestions
async function getYahooSuggestions(keyword: string, country: string = "us"): Promise<string[]> {
    try {
        const response = await fetch(
            `https://search.yahoo.com/sugg/gossip/gossip-${country}-ura/?output=sd1&command=${encodeURIComponent(keyword)}`,
            { cache: 'no-store' }
        );

        if (!response.ok) return [];

        const data = await response.json();

        return (
            data?.r
                ?.map((x: any) => x?.k)
                .filter(
                    (k: any): k is string =>
                        typeof k === 'string' && k.trim().length > 0
                ) || []
        );
    } catch {
        return [];
    }
}


// DuckDoGo suggestions
async function getDuckDuckGoSuggestions(keyword: string): Promise<string[]> {
    try {
        const response = await safeFetch(
            `https://duckduckgo.com/ac/?q=${encodeURIComponent(keyword)}&type=list`
        );

        if (!response?.ok) return [];

        const data = await response.json();

        return Array.isArray(data?.[1]) ? data[1] : [];
    } catch {
        return [];
    }
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const keywords: string[] = body.keywords || [];
        const country = body.country || 'US';
        const market = body.market || 'en-US';

        if (!Array.isArray(keywords) || keywords.length === 0) {
            return NextResponse.json(
                { error: 'A "keywords" array is required in the request body' },
                { status: 400, headers: corsHeaders }
            );
        }

        const validKeywords = keywords.filter(k => typeof k === 'string' && k.length >= 2);
        if (validKeywords.length === 0) {
            return NextResponse.json(
                { error: 'Keywords must be strings of at least 2 characters long' },
                { status: 400, headers: corsHeaders }
            );
        }

        const results: Record<string, string[]> = {};

        // Process all keywords in parallel
        await Promise.all(
            validKeywords.map(async (keyword) => {
                const [bing, duck, yahoo] = await Promise.all([
                    getBingSuggestions(keyword, country, market),
                    getDuckDuckGoSuggestions(keyword),
                    getYahooSuggestions(keyword, country),
                ]);

                results[keyword] = [...new Set([...bing, ...duck, ...yahoo])];
            })
        );

        return NextResponse.json(results, { headers: corsHeaders });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}


async function fetchWithTimeout(url: string, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        return await fetch(url, {
            signal: controller.signal,
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });
    } finally {
        clearTimeout(id);
    }
}


async function safeFetch(url: string) {
    try {
        return await fetchWithTimeout(url);
    } catch {
        await new Promise(r => setTimeout(r, 300));
        return fetchWithTimeout(url);
    }
}
