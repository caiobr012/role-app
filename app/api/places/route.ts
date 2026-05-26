import { NextRequest, NextResponse } from "next/server";
import { fetchPlaces } from "@/lib/overpass";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const cats = (searchParams.get("categorias") ?? "").split(",").filter(Boolean);
  const lat = parseFloat(searchParams.get("lat") ?? "-15.7801");
  const lng = parseFloat(searchParams.get("lng") ?? "-47.9292");
  const radius = parseInt(searchParams.get("radius") ?? "10000");

  if (cats.length === 0) {
    return NextResponse.json({ error: "Informe ao menos uma categoria" }, { status: 400 });
  }

  try {
    const places = await fetchPlaces(cats, lat, lng, radius);
    return NextResponse.json({ places, total: places.length }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("Overpass API error:", err);
    return NextResponse.json({ error: "Erro ao buscar lugares. Tente novamente." }, { status: 502 });
  }
}
