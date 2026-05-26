import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/google-places";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categoria = searchParams.get("categoria") ?? "bares";
  const lat = parseFloat(searchParams.get("lat") ?? "-20.4697");
  const lng = parseFloat(searchParams.get("lng") ?? "-54.6201");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const apiKey = process.env.GOOGLE_PLACES_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { places: [], configured: false },
      { status: 200 }
    );
  }

  try {
    const places = await searchPlaces(categoria, lat, lng, apiKey, limit);
    return NextResponse.json(
      { places, configured: true, total: places.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("Google Places error:", err);
    return NextResponse.json(
      { places: [], configured: true, error: String(err) },
      { status: 200 }
    );
  }
}
