// Google Places API (New) — https://developers.google.com/maps/documentation/places/web-service/overview
// Env var necessária: GOOGLE_PLACES_KEY

const BASE = "https://places.googleapis.com/v1";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.photos",
  "places.regularOpeningHours",
  "places.internationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.location",
  "places.priceLevel",
  "places.businessStatus",
].join(",");

export interface GooglePlace {
  id: string;
  nome: string;
  categoria: string;
  categoriaLabel: string;
  emoji: string;
  cor: string;
  lat: number;
  lng: number;
  endereco: string;
  telefone?: string;
  website?: string;
  horario?: string;
  rating?: number;
  totalAvaliacoes?: number;
  foto?: string;
  fotos?: string[]; // todas as fotos disponíveis para fallback
  fotoNome?: string;
}

// Queries por categoria
const CATEGORIA_QUERY: Record<string, string> = {
  bares:        "barzinho boteco bar Campo Grande MS",
  restaurantes: "restaurante Campo Grande MS",
  parques:      "parque praça Campo Grande MS",
  cultura:      "teatro cinema cultural Campo Grande MS",
  museus:       "museu Campo Grande MS",
  shows:        "show música ao vivo Campo Grande MS",
  feiras:       "feira mercado Campo Grande MS",
  esportes:     "esporte academia quadra Campo Grande MS",
};

const CATEGORIA_META: Record<string, { label: string; emoji: string; cor: string }> = {
  bares:        { label: "Bar / Boteco",  emoji: "🍺", cor: "from-yellow-500 to-amber-600" },
  restaurantes: { label: "Restaurante",  emoji: "🍽️", cor: "from-orange-400 to-red-500"  },
  parques:      { label: "Parque",       emoji: "🌿", cor: "from-teal-500 to-emerald-700" },
  cultura:      { label: "Cultural",     emoji: "🎭", cor: "from-purple-500 to-violet-700"},
  museus:       { label: "Museu",        emoji: "🏛️", cor: "from-amber-500 to-yellow-700"},
  shows:        { label: "Show",         emoji: "🎵", cor: "from-violet-600 to-purple-800"},
  feiras:       { label: "Feira",        emoji: "🛍️", cor: "from-pink-400 to-rose-500"  },
  esportes:     { label: "Esporte",      emoji: "⚽", cor: "from-emerald-500 to-teal-600"},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlace(p: any, categoria: string, apiKey: string): GooglePlace {
  const meta = CATEGORIA_META[categoria] ?? CATEGORIA_META.bares;

  // Todas as fotos disponíveis (até 5)
  const photoNames: string[] = (p.photos ?? [])
    .slice(0, 5)
    .map((ph: { name?: string }) => ph.name)
    .filter(Boolean);
  // URLs seguras — proxy server-side esconde a chave da API
  const fotos = photoNames.map(
    (name) => `/api/photo?name=${encodeURIComponent(name)}`
  );
  const foto = fotos[0];
  const fotoNome = photoNames[0];

  // Horário de hoje
  const hoje = new Date().getDay(); // 0=dom, 1=seg...
  const horariosArray: string[] | undefined =
    p.regularOpeningHours?.weekdayDescriptions;
  // weekdayDescriptions começa em segunda (índice 0), domingo é índice 6
  const idxHoje = hoje === 0 ? 6 : hoje - 1;
  const horarioHoje = horariosArray?.[idxHoje]?.split(": ")?.[1];

  return {
    id: p.id,
    nome: p.displayName?.text ?? "Sem nome",
    categoria,
    categoriaLabel: meta.label,
    emoji: meta.emoji,
    cor: meta.cor,
    lat: p.location?.latitude ?? -20.4697,
    lng: p.location?.longitude ?? -54.6201,
    endereco: p.formattedAddress ?? "",
    telefone: p.internationalPhoneNumber,
    website: p.websiteUri,
    horario: horarioHoje,
    rating: p.rating,
    totalAvaliacoes: p.userRatingCount,
    foto,
    fotos,
    fotoNome,
  };
}

export async function searchPlaces(
  categoria: string,
  lat: number,
  lng: number,
  apiKey: string,
  limit = 20,
  customQuery?: string
): Promise<GooglePlace[]> {
  const base = customQuery ?? CATEGORIA_QUERY[categoria] ?? categoria;
  const query = base.includes("Campo Grande") ? base : `${base} Campo Grande MS`;

  const body = {
    textQuery: query,
    languageCode: "pt-BR",
    regionCode: "BR",
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 15000.0,
      },
    },
    maxResultCount: Math.min(limit, 20),
    openNow: false,
  };

  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Google Places API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return (data.places ?? [])
    .filter((p: { businessStatus?: string }) => p.businessStatus !== "CLOSED_PERMANENTLY")
    .slice(0, limit)
    .map((p: unknown) => mapPlace(p, categoria, apiKey));
}
