"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { MapPin, Phone, Globe, Clock, Star, CalendarPlus, X, Loader2, CheckCircle2 } from "lucide-react";
import type { GooglePlace } from "@/lib/google-places";
import PlaceScheduler from "./PlaceScheduler";
import VisitaModal from "./VisitaModal";
import type { PlaceEx } from "@/lib/campo-grande";

interface Props {
  cats: string[];
  lat: number;
  lng: number;
}

// ── Queries específicas por filtro (re-fetch no Google Places) ─────────────────

const FILTER_QUERIES: Record<string, Record<string, string>> = {
  bares: {
    "Boteco":          "boteco barzinho bar popular",
    "Pub":             "pub cervejaria artesanal chopp draft",
    "Balada":          "balada nightclub boate danceteria",
    "Rooftop":         "rooftop sky bar terraço vista",
    "Música ao vivo":  "bar show música ao vivo palco",
    "Sertanejo":       "bar sertanejo baladão country",
    "Karaokê":         "karaokê karaoke bar",
    "Happy Hour":      "happy hour bar aperitivo happy",
  },
  restaurantes: {
    "Pizza":          "pizzaria pizza",
    "Sushi":          "sushi temaki japonês culinária japonesa",
    "Churrasco":      "churrascaria churrasco assado rodízio carne",
    "Árabe":          "árabe esfiha kebab sírio libanês",
    "Italiana":       "restaurante italiano italiana massa cantina trattoria",
    "Vegetariano":    "restaurante vegano vegetariano natural saudável",
    "Frutos do mar":  "restaurante peixe frutos do mar camarão pescado",
    "Buffet":         "restaurante buffet por quilo self service",
  },
  parques: {
    "Ciclismo":   "ciclismo pista ciclável bike park",
    "Esportes":   "quadra esportiva campo parque esporte",
    "Piquenique": "jardim gramado parque lazer picnic",
    "Trilha":     "trilha ecológica bosque parque natural",
  },
  shows: {
    "Rock":       "show rock concerto banda",
    "Sertanejo":  "show sertanejo festival forró",
    "MPB":        "show samba mpb bossa nova popular",
    "Funk":       "baile funk funk show",
    "Eletrônico": "balada eletrônica rave dj set",
    "Gratuito":   "evento gratuito show entrada franca",
  },
  museus: {
    "Arte":       "museu arte galeria pintura",
    "História":   "museu histórico memória patrimônio",
    "Ciência":    "museu ciência tecnologia inovação",
    "Interativo": "museu interativo infantil experiência",
  },
  cultura: {
    "Cinema":  "cinema sala de cinema",
    "Teatro":  "teatro espetáculo peça teatral",
    "Dança":   "dança ballet balé espetáculo",
    "Galeria": "galeria arte exposição vernissage",
  },
  feiras: {
    "Artesanato": "feira artesanato handmade artesanal",
    "Orgânica":   "feira orgânica agroecológica produtos naturais",
    "Noturna":    "feira noturna noite gastronômica",
    "Cultural":   "feira cultural folclore tradicional",
  },
  esportes: {
    "Futebol":        "campo futebol society futsal",
    "Academia":       "academia musculação fitness crossfit gym",
    "Natação":        "piscina natação aquático swimming",
    "Artes Marciais": "academia jiu jitsu capoeira boxe muay thai",
    "Corrida":        "pista corrida atletismo running",
  },
};

// ── Converter GooglePlace → PlaceEx ────────────────────────────────────────────

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

// ── GooglePlaceCard ────────────────────────────────────────────────────────────

function GooglePlaceCard({
  place,
  onSchedule,
  onVisita,
}: {
  place: GooglePlace;
  onSchedule: (p: PlaceEx) => void;
  onVisita: (p: PlaceEx) => void;
}) {
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.id}`;
  const allPhotos = place.fotos?.length ? place.fotos : place.foto ? [place.foto] : [];
  const [photoIdx, setPhotoIdx] = useState(0);
  const currentPhoto = allPhotos[photoIdx];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
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
            unoptimized
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${place.cor} flex items-center justify-center`}>
            <span className="text-5xl">{place.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {place.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
            <Star size={11} fill="currentColor" className="text-amber-400" />
            {place.rating.toFixed(1)}
            {place.totalAvaliacoes && (
              <span className="text-white/70">
                ({place.totalAvaliacoes > 999
                  ? `${(place.totalAvaliacoes / 1000).toFixed(1)}k`
                  : place.totalAvaliacoes})
              </span>
            )}
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="text-[11px] font-semibold bg-white/90 text-gray-800 px-2 py-0.5 rounded-full">
            {place.categoriaLabel}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
          <p className="font-bold text-white text-sm leading-snug drop-shadow">{place.nome}</p>
        </div>
      </div>

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

        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
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
            onClick={() => onVisita(toPlaceEx(place))}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg"
          >
            <CheckCircle2 size={12} /> Fui aqui
          </button>
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

// ── Labels ─────────────────────────────────────────────────────────────────────

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

// ── Seção por categoria com filtros ───────────────────────────────────────────

function CategorySection({
  cat,
  originalPlaces,
  lat,
  lng,
  onSchedule,
  onVisita,
}: {
  cat: string;
  originalPlaces: GooglePlace[];
  lat: number;
  lng: number;
  onSchedule: (p: PlaceEx) => void;
  onVisita: (p: PlaceEx) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filteredPlaces, setFilteredPlaces] = useState<GooglePlace[] | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const filters = Object.keys(FILTER_QUERIES[cat] ?? {});

  const fetchFiltered = useCallback(
    async (label: string) => {
      const queryTerm = FILTER_QUERIES[cat]?.[label];
      if (!queryTerm) return;
      setFilterLoading(true);
      try {
        const res = await fetch(
          `/api/google-places?categoria=${cat}&query=${encodeURIComponent(queryTerm)}&lat=${lat}&lng=${lng}&limit=20`
        );
        const data = await res.json();
        setFilteredPlaces(data.places ?? []);
      } catch {
        setFilteredPlaces([]);
      } finally {
        setFilterLoading(false);
      }
    },
    [cat, lat, lng]
  );

  async function toggleFilter(label: string) {
    if (activeFilter === label) {
      setActiveFilter(null);
      setFilteredPlaces(null);
      return;
    }
    setActiveFilter(label);
    await fetchFiltered(label);
  }

  const displayPlaces = filteredPlaces ?? originalPlaces;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {CAT_LABEL[cat] ?? cat}
        </h2>
        {activeFilter && (
          <button
            onClick={() => { setActiveFilter(null); setFilteredPlaces(null); }}
            className="text-[11px] text-violet-600 font-semibold flex items-center gap-1"
          >
            <X size={11} /> Limpar
          </button>
        )}
        {!activeFilter && (
          <span className="text-[11px] text-gray-300">via Google Maps</span>
        )}
      </div>

      {/* Chips de filtro */}
      {filters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-3">
          {filters.map((label) => {
            const isOn = activeFilter === label;
            return (
              <button
                key={label}
                onClick={() => toggleFilter(label)}
                disabled={filterLoading && !isOn}
                className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  isOn
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                {filterLoading && isOn && <Loader2 size={10} className="animate-spin" />}
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Skeleton de carregamento */}
      {filterLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de lugares */}
      {!filterLoading && displayPlaces.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-sm text-gray-400">Nenhum resultado para este filtro</p>
          <button
            onClick={() => { setActiveFilter(null); setFilteredPlaces(null); }}
            className="text-xs text-violet-600 font-semibold mt-1.5 underline"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {!filterLoading && displayPlaces.length > 0 && (
        <div className="space-y-3">
          {displayPlaces.map((place) => (
            <GooglePlaceCard
              key={place.id}
              place={place}
              onSchedule={onSchedule}
              onVisita={onVisita}
            />
          ))}
          {activeFilter && (
            <p className="text-[11px] text-gray-400 text-center">
              {displayPlaces.length} resultados para &ldquo;{activeFilter}&rdquo;
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function GooglePlacesSection({ cats, lat, lng }: Props) {
  const [results, setResults] = useState<Record<string, GooglePlace[]>>({});
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [scheduling, setScheduling] = useState<PlaceEx | null>(null);
  const [visitando, setVisitando] = useState<PlaceEx | null>(null);

  useEffect(() => {
    if (!cats.length) { setLoading(false); return; }
    let cancelled = false;

    async function loadAll() {
      try {
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
        // silencioso
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="space-y-6">
        {Object.entries(results).map(([cat, places]) =>
          places.length === 0 ? null : (
            <CategorySection
              key={cat}
              cat={cat}
              originalPlaces={places}
              lat={lat}
              lng={lng}
              onSchedule={setScheduling}
              onVisita={setVisitando}
            />
          )
        )}
      </div>

      {scheduling && (
        <PlaceScheduler place={scheduling} onClose={() => setScheduling(null)} />
      )}
      {visitando && (
        <VisitaModal place={visitando} onClose={() => setVisitando(null)} />
      )}
    </>
  );
}
