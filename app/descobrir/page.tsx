import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCGPlacesByCategoria, type PlaceEx } from "@/lib/campo-grande";
import PlacesWithScheduler from "@/components/PlacesWithScheduler";
import BottomNav from "@/components/BottomNav";

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
  searchParams: Promise<{ quando?: string; categorias?: string; lat?: string; lng?: string }>;
}

export default async function DescobrirPage({ searchParams }: Props) {
  const sp = await searchParams;
  const quando   = sp.quando ?? "hoje";
  const cats     = (sp.categorias ?? "").split(",").filter(Boolean);

  const places = getCGPlacesByCategoria(cats);

  // Agrupa por categoria
  const grouped: Record<string, PlaceEx[]> = {};
  for (const p of places) {
    if (!grouped[p.categoria]) grouped[p.categoria] = [];
    grouped[p.categoria].push(p);
  }

  const quandoLabel = QUANDO_LABEL[quando] ?? quando;
  const catsLabel   = cats.length ? cats.map((c) => CAT_LABEL[c] ?? c).join(", ") : "Todas as categorias";

  return (
    <div className="min-h-screen bg-gray-50 pb-28 max-w-lg mx-auto">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium">{quandoLabel} · Campo Grande, MS</p>
            <h1 className="text-base font-bold text-gray-900 leading-tight truncate">{catsLabel}</h1>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{places.length} lugares</span>
        </div>
      </div>

      {/* Lista com agendamento */}
      <div className="px-4 mt-4 space-y-6">
        <PlacesWithScheduler grouped={grouped} />
      </div>

      <BottomNav />
    </div>
  );
}
