"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Globe, Clock, Star, CalendarPlus } from "lucide-react";
import type { GooglePlace } from "@/lib/google-places";
import PlaceScheduler from "./PlaceScheduler";
import type { PlaceEx } from "@/lib/campo-grande";

interface Props {
  cats: string[];
  lat: number;
  lng: number;
}

// Converte GooglePlace → PlaceEx para reusar o Scheduler
function toPlaceEx(g: GooglePlace): PlaceEx {
  return {
    id: g.id,
    nome: g.nome,
    categoria: g.categoria,
    categoriaLabel: g.categoriaLabel,
    emoji: g.emoji,
    cor: g.cor,
    lat: g.lat,
    lng: g.lng,
    endereco: g.endereco,
    telefone: g.telefone,
    website: g.website,
    horario: g.horario,
    foto: g.foto,
  };
}

function GooglePlaceCard({
  place,
  onSchedule,
}: {
  place: GooglePlace;
  onSchedule: (p: PlaceEx) => void;
}) {
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.id}`;
  const allPhotos = place.fotos?.length ? place.fotos : place.foto ? [place.foto] : [];
  const [photoIdx, setPhotoIdx] = useState(0);

  const currentPhoto = allPhotos[photoIdx];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Foto real do Google Maps */}
      <div className="relative h-44 bg-gray-100">
        {currentPhoto ? (
          <Image
            src={currentPhoto}
            alt={place.nome}
            fill
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover"
            onError={() => {
              if (photoIdx < allPhotos.length - 1) setPhotoIdx(photoIdx + 1);
            }}
            unoptimized // necessário para URLs externas dinâmicas do Google
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${place.cor} flex items-center justify-center`}>
            <span className="text-5xl">{place.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Rating */}
        {place.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
            <Star size={11} fill="currentColor" className="text-amber-400" />
            {place.rating.toFixed(1)}
            {place.totalAvaliacoes && (
              <span className="text-white/70">({place.totalAvaliacoes > 999 ? `${(place.totalAvaliacoes / 1000).toFixed(1)}k` : place.totalAvaliacoes})</span>
            )}
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[11px] font-semibold bg-white/90 text-gray-800 px-2 py-0.5 rounded-full">
            {place.categoriaLabel}
          </span>
        </div>

        {/* Nome */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
          <p className="font-bold text-white text-sm leading-snug drop-shadow">
            {place.nome}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3 space-y-1.5">
        <div className="flex items-start gap-1.5">
          <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500 leading-snug line-clamp-2">{place.endereco}</p>
        </div>

        {place.horario && (
          <div className="flex items-start gap-1.5">
            <Clock size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 line-clamp-1">{place.horario}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-1.5 pt-1">
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
            <MapPin size={11} /> Maps
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
          <button
            onClick={() => onSchedule(toPlaceEx(place))}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-violet-600 px-3 py-1.5 rounded-lg ml-auto"
          >
            <CalendarPlus size={12} /> Marcar rolê
          </button>
        </div>
      </div>
    </div>
  );
}

const CAT_LABEL: Record<string, string> = {
  bares:        "Bares e Botecos",
  restaurantes: "Restaurantes",
  parques:      "Parques",
  cultura:      "Cultura",
  museus:       "Museus",
  shows:        "Shows",
  feiras:       "Feiras",
  esportes:     "Esportes",
};

export default function GooglePlacesSection({ cats, lat, lng }: Props) {
  const [results, setResults] = useState<Record<string, GooglePlace[]>>({});
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [scheduling, setScheduling] = useState<PlaceEx | null>(null);

  useEffect(() => {
    if (!cats.length) { setLoading(false); return; }

    let cancelled = false;

    async function loadAll() {
      try {
        // Busca cada categoria em paralelo
        const entries = await Promise.all(
          cats.map(async (cat) => {
            const res = await fetch(
              `/api/google-places?categoria=${cat}&lat=${lat}&lng=${lng}&limit=20`
            );
            if (!res.ok) return [cat, []] as [string, GooglePlace[]];
            const data = await res.json();
            if (data.configured) setConfigured(true);
            return [cat, data.places ?? []] as [string, GooglePlace[]];
          })
        );
        if (!cancelled) setResults(Object.fromEntries(entries));
      } catch {
        // silencia
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API não configurada — mostra nada (dados curados já estão visíveis)
  if (!loading && !configured) return null;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center">Carregando do Google Maps...</p>
      </div>
    );
  }

  const totalPlaces = Object.values(results).flat().length;
  if (!totalPlaces) return null;

  return (
    <>
      {Object.entries(results).map(([cat, places]) =>
        places.length === 0 ? null : (
          <section key={cat}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {CAT_LABEL[cat] ?? cat}
              </h2>
              <span className="text-[11px] text-gray-300 flex items-center gap-0.5">
                via Google Maps
              </span>
            </div>
            <div className="space-y-3">
              {places.map((place) => (
                <GooglePlaceCard
                  key={place.id}
                  place={place}
                  onSchedule={setScheduling}
                />
              ))}
            </div>
          </section>
        )
      )}

      {scheduling && (
        <PlaceScheduler place={scheduling} onClose={() => setScheduling(null)} />
      )}
    </>
  );
}
