import Link from "next/link";
import type { Place } from "@/lib/overpass";
import { formatDistancia } from "@/lib/overpass";
import { Phone, Globe, Clock } from "lucide-react";

export default function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-violet-100">
      <div className="flex gap-0">
        <div className={`bg-gradient-to-br ${place.cor} w-20 flex-shrink-0 flex items-center justify-center`}>
          <span className="text-3xl">{place.emoji}</span>
        </div>
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              {place.categoriaLabel}
            </span>
            {place.distanciaM !== undefined && (
              <span className="text-[11px] text-gray-400 flex-shrink-0">
                📍 {formatDistancia(place.distanciaM)}
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 mt-1 text-sm leading-snug line-clamp-1">
            {place.nome}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{place.endereco}</p>

          {/* Horário se disponível */}
          {place.horario && (
            <div className="flex items-center gap-1 mt-1">
              <Clock size={11} className="text-green-500 flex-shrink-0" />
              <span className="text-[11px] text-green-600 truncate">{place.horario.split(";")[0]}</span>
            </div>
          )}

          {/* Links */}
          <div className="flex gap-2 mt-2">
            {place.telefone && (
              <a
                href={`tel:${place.telefone}`}
                className="flex items-center gap-1 bg-violet-50 text-violet-600 text-[11px] font-medium px-2 py-1 rounded-lg"
              >
                <Phone size={11} /> Ligar
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-medium px-2 py-1 rounded-lg"
              >
                <Globe size={11} /> Site
              </a>
            )}
            <a
              href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-gray-50 text-gray-600 text-[11px] font-medium px-2 py-1 rounded-lg ml-auto"
            >
              🗺️ Mapa
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
