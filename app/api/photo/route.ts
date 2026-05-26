import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return new NextResponse(null, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_KEY?.trim();
  if (!apiKey) return new NextResponse(null, { status: 204 });

  // Sem skipHttpRedirect: Google retorna 302 → CDN. fetch() segue o redirect
  // e devolve os bytes da imagem real.
  const res = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&key=${apiKey}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) return new NextResponse(null, { status: res.status });

  const contentType = res.headers.get("Content-Type") ?? "image/jpeg";
  return new NextResponse(res.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
