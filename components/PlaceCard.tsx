import Image from "next/image";
import {
  Phone, Globe, MapPin, Clock, CalendarPlus,
  Beer, UtensilsCrossed, TreePine, Drama,
  Landmark, Music, ShoppingBag, Trophy, Compass,
} from "lucide-react";
import type { PlaceEx } from "@/lib/campo-grande";
import { FOTOS_CATEGORIA } from "@/lib/campo-grande";
import { formatDistancia } from "@/lib/overpass";

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

const CAT_CHIP: Record<string, string> = {
  bares:        "bg-amber-100  text-amber-800",
  restaurantes: "bg-orange-100 text-orange-800",
  parques:      "bg-emerald-100 text-emerald-800",
  cultura:      "bg-purple-100 text-purple-800",
  museus:       "bg-yellow-100 text-yellow-900",
  shows:        "bg-violet-100 text-violet-800",
  feiras:       "bg-pink-100   text-pink-800",
  esportes:     "bg-teal-100   text-teal-800",
};

interface Props {
  place: PlaceEx;
  onSchedule: (place: PlaceEx) => void;
}

export default function PlaceCard({ place, onSchedule }: Props) {
  const Icon = CAT_ICONS[place.categoria] ?? Compass;
  const chip = CAT_CHIP[place.categoria] ?? "bg-gray-100 text-gray-700";
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.nome + " Campo Grande MS")}`;
  const foto = place.foto ?? FOTOS_CATEGORIA[place.categoria] ?? FOTOS_CATEGORIA.parques;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Foto */}
      <div className="relative h-40">
        <Image
          src={foto}
          alt={place.nome}
          fill
          sizes="(max-width: 512px) 100vw, 512px"
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Gradiente sobre a foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badge categoria */}
        <div className="absolute top-2 left-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${chip}`}>
            {place.categoriaLabel}
          </span>
        </div>

        {/* Distância */}
        {place.distanciaM !== undefined && (
          <div className="absolute top-2 right-2">
            <span className="text-[11px] font-medium bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {formatDistancia(place.distanciaM)}
            </span>
          </div>
        )}

        {/* Nome sobre a foto */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center flex-shrink-0">
              <Icon size={13} className="text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm leading-snug drop-shadow">
              {place.nome}
            </h3>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-3 py-3">
        {/* Endereço */}
        <div className="flex items-start gap-1.5">
          <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500 leading-snug line-clamp-1">{place.endereco}</p>
        </div>

        {/* Horário */}
        {place.horario && (
          <div className="flex items-start gap-1.5 mt-1">
            <Clock size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 line-clamp-1">{place.horario}</p>
          </div>
        )}

        {/* Descrição */}
        {place.descricao && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {place.descricao}
          </p>
        )}

        {/* Ações */}
        <div className="flex items-center gap-2 mt-3">
          {place.telefone && (
            <a
              href={`tel:${place.telefone}`}
              className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg"
            >
              <Phone size={11} /> Ligar
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg"
          >
            <MapPin size={11} /> Ver no mapa
          </a>
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg"
            >
              <Globe size={11} /> Site
            </a>
          )}

          {/* Botão principal de marcar */}
          <button
            onClick={() => onSchedule(place)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-violet-600 px-3 py-1.5 rounded-lg ml-auto"
          >
            <CalendarPlus size={12} /> Marcar rolê
          </button>
        </div>
      </div>
    </div>
  );
}
