import { NextRequest, NextResponse } from "next/server";

const BASE = "https://places.googleapis.com/v1";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_KEY?.trim();
  if (!apiKey) return new NextResponse(null, { status: 204 });

  const res = await fetch(
    `${BASE}/${name}/media?maxWidthPx=800&key=${apiKey}&skipHttpRedirect=true`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) return new NextResponse(null, { status: res.status });

  const data = await res.json();
  const photoUri: string | undefined = data.photoUri;
  if (!photoUri) return new NextResponse(null, { status: 404 });

  return NextResponse.redirect(photoUri, {
    headers: { "Cache-Control": "public, max-age=86400, immutable" },
  });
}
