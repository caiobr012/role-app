import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { fetchPlaces, type Place } from "@/lib/overpass";
import PlaceCard from "@/components/PlaceCard";
import BottomNav from "@/components/BottomNav";

const QUANDO_LABELS: Record<string, string> = {
  hoje:   "🔥 Hoje",
  amanha: "📅 Amanhã",
  fds:    "🎉 Fim de semana",
  semana: "📆 Esta semana",
};

const CAT_LABELS: Record<string, string> = {
  bares:        "🍺 Bares",
  restaurantes: "🍽️ Restaurantes",
  parques:      "🌿 Parques",
  cultura:      "🎭 Cultura",
  museus:       "🏛️ Museus",
  shows:        "🎵 Shows",
  feiras:       "🛍️ Feiras",
  esportes:     "⚽ Esportes",
};

interface Props {
  searchParams: Promise<{
    quando?: string;
    categorias?: string;
    lat?: string;
    lng?: string;
  }>;
}

export default async function DescobrirPage({ searchParams }: Props) {
  const params = await searchParams;

  const quando = params.quando ?? "hoje";
  const cats = (params.categorias ?? "").split(",").filter(Boolean);
  const lat = parseFloat(params.lat ?? "-15.7801");
  const lng = parseFloat(params.lng ?? "-47.9292");

  // Busca dados reais no Overpass/OSM
  let places: Place[] = [];
  let errorMsg: string | null = null;

  try {
    places = await fetchPlaces(cats, lat, lng, 10000, 50);
  } catch {
    errorMsg = "Não conseguimos conectar ao mapa. Verifique sua internet.";
  }

  // Agrupa por categoria
  const grouped: Record<string, Place[]> = {};
  for (const p of places) {
    if (!grouped[p.categoria]) grouped[p.categoria] = [];
    grouped[p.categoria].push(p);
  }

  const hasResults = places.length > 0;
  const backUrl = "/";

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href={backUrl}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-lg leading-tight">
              {QUANDO_LABELS[quando] ?? quando}
            </h1>
            <p className="text-violet-200 text-xs mt-0.5">
              {hasResults ? `${places.length} lugares encontrados` : "Procurando..."}
            </p>
          </div>
        </div>

        {/* Chips de categoria selecionada */}
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <span
                key={c}
                className="text-[11px] font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm"
              >
                {CAT_LABELS[c] ?? c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-5 space-y-6">
        {/* Erro */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Ops, algo deu errado</p>
              <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Nenhum resultado */}
        {!errorMsg && !hasResults && (
          <div className="text-center py-16">
            <span className="text-5xl">🔍</span>
            <p className="text-gray-700 font-bold mt-3">Nenhum lugar encontrado</p>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              Não achamos resultados para essa combinação no OpenStreetMap.
              Tente outras categorias ou aumente o raio de busca.
            </p>
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 mt-5 bg-violet-600 text-white font-semibold px-5 py-3 rounded-2xl"
            >
              <RefreshCw size={16} /> Tentar de novo
            </Link>
          </div>
        )}

        {/* Resultados por categoria */}
        {hasResults &&
          Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="font-bold text-gray-900 text-base mb-3">
                {CAT_LABELS[cat] ?? cat}{" "}
                <span className="text-xs font-normal text-gray-400">({items.length})</span>
              </h2>
              <div className="space-y-3">
                {items.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </section>
          ))}

        {/* Fonte dos dados */}
        {hasResults && (
          <p className="text-center text-xs text-gray-400 pb-4">
            Dados do{" "}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 underline"
            >
              OpenStreetMap
            </a>{" "}
            · atualizado a cada hora
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
