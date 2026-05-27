import { NextRequest, NextResponse } from "next/server";
import { put, head, del } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN ?? "";

function blobPath(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 50);
  return `role-data/${slug}.json`;
}

export async function GET(req: NextRequest) {
  const nome = req.nextUrl.searchParams.get("nome")?.trim();
  if (!nome) return NextResponse.json({ ok: false, error: "nome required" }, { status: 400 });

  // Ping para verificar se o sync está configurado
  if (nome === "__ping__") {
    return NextResponse.json({ ok: true, configured: !!TOKEN });
  }

  if (!TOKEN) return NextResponse.json({ ok: false, reason: "not-configured" });

  try {
    const path = blobPath(nome);
    const meta = await head(path, { token: TOKEN });
    if (!meta) return NextResponse.json({ ok: true, data: null });

    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ ok: true, data: null });

    const data = await res.json();
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: null });
  }
}

export async function POST(req: NextRequest) {
  const nome = req.nextUrl.searchParams.get("nome")?.trim();
  if (!nome) return NextResponse.json({ ok: false, error: "nome required" }, { status: 400 });
  if (!TOKEN) return NextResponse.json({ ok: false, reason: "not-configured" });

  const body = await req.json();
  const path = blobPath(nome);

  await put(path, JSON.stringify(body), {
    access: "public",
    token: TOKEN,
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const nome = req.nextUrl.searchParams.get("nome")?.trim();
  if (!nome || !TOKEN) return NextResponse.json({ ok: false });

  try {
    const meta = await head(blobPath(nome), { token: TOKEN });
    if (meta) await del(meta.url, { token: TOKEN });
  } catch { /* blob may not exist */ }

  return NextResponse.json({ ok: true });
}
