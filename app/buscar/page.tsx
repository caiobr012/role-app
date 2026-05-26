import { Suspense } from "react";
import Link from "next/link";
import { searchEventos } from "@/lib/data";
import EventCard from "@/components/EventCard";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const resultados = q ? searchEventos(q) : [];

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-24 max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <h1 className="text-white font-bold text-lg">Buscar</h1>
        </div>
        <form method="GET" action="/buscar" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Shows, bares, parques..."
            autoFocus
            className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
        </form>
      </div>

      <div className="px-4 mt-5">
        {!q ? (
          <div className="text-center py-16">
            <span className="text-5xl">🔍</span>
            <p className="text-gray-500 mt-3 font-medium">O que você procura?</p>
            <p className="text-gray-400 text-sm mt-1">Busque shows, bares, restaurantes e mais</p>
          </div>
        ) : resultados.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">😕</span>
            <p className="text-gray-500 mt-3 font-medium">Nenhum resultado para &quot;{q}&quot;</p>
            <p className="text-gray-400 text-sm mt-1">Tente outras palavras</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              <strong className="text-gray-800">{resultados.length}</strong> resultado{resultados.length !== 1 ? "s" : ""} para &quot;{q}&quot;
            </p>
            <div className="space-y-3">
              {resultados.map((e) => (
                <EventCard key={e.id} evento={e} />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
