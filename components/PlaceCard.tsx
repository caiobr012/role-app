import type { Place } from "@/lib/overpass";
import { formatDistancia } from "@/lib/overpass";
import {
  Phone, Globe, MapPin, Clock,
  Beer, UtensilsCrossed, TreePine, Drama,
  Landmark, Music, ShoppingBag, Trophy, Compass,
} from "lucide-react";

const CAT_ICONS: Record<string, React.ElementType> = {
  bares:        Beer,
  restaurantes: UtensilsCrossed,
  parques:      TreePine,
  cultura:      Drama,
  museus:       Landmark,
  shows:        Music,
  feiras:       ShoppingBag,
  esportes:     Trophy,
};

const CAT_COLORS: Record<string, string> = {
  bares:        "bg-amber-50  text-amber-700",
  restaurantes: "bg-orange-50 text-orange-700",
  parques:      "bg-emerald-50 text-emerald-700",
  cultura:      "bg-purple-50 text-purple-700",
  museus:       "bg-yellow-50 text-yellow-800",
  shows:        "bg-violet-50 text-violet-700",
  feiras:       "bg-pink-50   text-pink-700",
  esportes:     "bg-teal-50   text-teal-700",
};

const CAT_ICON_BG: Record<string, string> = {
  bares:        "bg-amber-100  text-amber-600",
  restaurantes: "bg-orange-100 text-orange-600",
  parques:      "bg-emerald-100 text-emerald-600",
  cultura:      "bg-purple-100 text-purple-600",
  museus:       "bg-yellow-100 text-yellow-700",
  shows:        "bg-violet-100 text-violet-600",
  feiras:       "bg-pink-100   text-pink-600",
  esportes:     "bg-teal-100   text-teal-600",
};

export default function PlaceCard({ place }: { place: Place }) {
  const Icon = CAT_ICONS[place.categoria] ?? Compass;
  const chipCls = CAT_COLORS[place.categoria] ?? "bg-gray-100 text-gray-600";
  const iconBg  = CAT_ICON_BG[place.categoria] ?? "bg-gray-100 text-gray-500";
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.nome + " Campo Grande MS")}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="flex items-stretch gap-0">
        {/* ícone lateral */}
        <div className="flex items-center justify-center w-16 flex-shrink-0 border-r border-gray-100">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon size={18} />
          </div>
        </div>

        {/* conteúdo */}
        <div className="flex-1 px-3 py-3 min-w-0">
          {/* linha 1: categoria + distância */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${chipCls}`}>
              {place.categoriaLabel}
            </span>
            {place.distanciaM !== undefined && (
              <span className="text-[11px] text-gray-400 tabular-nums">
                {formatDistancia(place.distanciaM)}
              </span>
            )}
          </div>

          {/* nome */}
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
            {place.nome}
          </p>

          {/* endereço */}
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{place.endereco}</p>

          {/* horário */}
          {place.horario && (
            <div className="flex items-center gap-1 mt-1">
              <Clock size={10} className="text-gray-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{place.horario.split(";")[0]}</span>
            </div>
          )}

          {/* ações */}
          <div className="flex items-center gap-1.5 mt-2">
            {place.telefone && (
              <a
                href={`tel:${place.telefone}`}
                className="flex items-center gap-1 text-[11px] font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-lg"
              >
                <Phone size={10} /> Ligar
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg"
              >
                <Globe size={10} /> Site
              </a>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg ml-auto"
            >
              <MapPin size={10} /> Ver no mapa
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
