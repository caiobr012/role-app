import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCGPlacesByCategoria } from "@/lib/campo-grande";
import PlaceCard from "@/components/PlaceCard";
import BottomNav from "@/components/BottomNav";
import OverpassEnhancer from "@/components/OverpassEnhancer";

const QUANDO_LABEL: Record<string, string> = {
  hoje:   "Hoje",
  amanha: "Amanhã",
  fds:    "Fim de semana",
  semana: "Esta semana",
};

const CAT_LABEL: Record<string, string> = {
  bares:        "Bares",
  restaurantes: "Restaurantes",
  parques:      "Parques",
  cultura:      "Cultura",
  museus:       "Museus",
  shows:        "Shows",
  feiras:       "Feiras",
  esportes:     "Esportes",
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
  const sp = await searchParams;
  const quando = sp.quando ?? "hoje";
  const cats = (sp.categorias ?? "").split(",").filter(Boolean);
  const lat = parseFloat(sp.lat ?? "-20.4697");
  const lng = parseFloat(sp.lng ?? "-54.6201");

  // Dados curados instantâneos — nunca falham
  const curados = getCGPlacesByCategoria(cats);

  // Agrupa por categoria
  const grouped: Record<string, typeof curados> = {};
  for (const p of curados) {
    if (!grouped[p.categoria]) grouped[p.categoria] = [];
    grouped[p.categoria].push(p);
  }

  const quandoLabel = QUANDO_LABEL[quando] ?? quando;
  const catsLabel = cats.length
    ? cats.map((c) => CAT_LABEL[c] ?? c).join(", ")
    : "Tudo";

  return (
    <div className="min-h-screen bg-gray-50 pb-28 max-w-lg mx-auto">
      {/* cabeçalho */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">{quandoLabel}</p>
            <h1 className="text-base font-bold text-gray-900 leading-tight truncate">{catsLabel}</h1>
          </div>
          <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
            {curados.length} lugares
          </span>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-6">
        {/* Dados curados por categoria */}
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {CAT_LABEL[cat] ?? cat}
            </h2>
            <div className="space-y-2">
              {items.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        ))}

        {/* Enhancer client-side: busca extra no Overpass sem bloquear */}
        <OverpassEnhancer
          cats={cats}
          lat={lat}
          lng={lng}
          curadosIds={curados.map((p) => p.id)}
        />

        <p className="text-center text-xs text-gray-300 pb-2">
          Dados curados para Campo Grande, MS
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
