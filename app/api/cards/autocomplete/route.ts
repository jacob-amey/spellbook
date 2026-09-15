import { NextResponse } from "next/server";

import { autocompleteCardNames } from "@/lib/scryfall-server";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length > 256) {
    return NextResponse.json({ suggestions: [] }, { status: 400 });
  }

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await autocompleteCardNames(query);

    return NextResponse.json(
      { suggestions },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { suggestions: [] },
      { status: 503 },
    );
  }
}
