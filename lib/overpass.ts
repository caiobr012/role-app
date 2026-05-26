export interface Place {
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
  distanciaM?: number;
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// OSM tags por categoria
const CATEGORY_TAGS: Record<string, { key: string; value: string }[]> = {
  bares: [
    { key: "amenity", value: "bar" },
    { key: "amenity", value: "pub" },
    { key: "amenity", value: "nightclub" },
  ],
  restaurantes: [
    { key: "amenity", value: "restaurant" },
    { key: "amenity", value: "fast_food" },
    { key: "amenity", value: "cafe" },
  ],
  parques: [
    { key: "leisure", value: "park" },
    { key: "leisure", value: "garden" },
    { key: "leisure", value: "nature_reserve" },
  ],
  museus: [
    { key: "tourism", value: "museum" },
    { key: "historic", value: "monument" },
  ],
  cultura: [
    { key: "amenity", value: "theatre" },
    { key: "amenity", value: "cinema" },
    { key: "amenity", value: "arts_centre" },
    { key: "tourism", value: "gallery" },
  ],
  shows: [
    { key: "amenity", value: "nightclub" },
    { key: "amenity", value: "music_venue" },
    { key: "leisure", value: "music_venue" },
    { key: "amenity", value: "concert_hall" },
  ],
  feiras: [
    { key: "amenity", value: "marketplace" },
    { key: "shop", value: "mall" },
  ],
  esportes: [
    { key: "leisure", value: "sports_centre" },
    { key: "leisure", value: "stadium" },
    { key: "leisure", value: "fitness_centre" },
  ],
};

const CATEGORIA_META: Record<string, { label: string; emoji: string; cor: string }> = {
  bares:       { label: "Bar",        emoji: "🍺", cor: "from-yellow-500 to-amber-600" },
  restaurantes:{ label: "Restaurante",emoji: "🍽️", cor: "from-orange-400 to-red-500"  },
  parques:     { label: "Parque",     emoji: "🌿", cor: "from-teal-400 to-cyan-600"   },
  museus:      { label: "Museu",      emoji: "🏛️", cor: "from-amber-600 to-yellow-700"},
  cultura:     { label: "Cultura",    emoji: "🎭", cor: "from-purple-500 to-violet-700"},
  shows:       { label: "Show",       emoji: "🎵", cor: "from-violet-600 to-purple-800"},
  feiras:      { label: "Feira",      emoji: "🛍️", cor: "from-pink-400 to-rose-500"  },
  esportes:    { label: "Esporte",    emoji: "⚽", cor: "from-emerald-500 to-teal-600"},
};

function buildOverpassQuery(
  lat: number,
  lng: number,
  radiusM: number,
  categorias: string[]
): string {
  const tags = categorias.flatMap((cat) => CATEGORY_TAGS[cat] ?? []);
  const nodeLines = tags.map(
    ({ key, value }) => `  node["${key}"="${value}"](around:${radiusM},${lat},${lng});`
  );
  const wayLines = tags.map(
    ({ key, value }) => `  way["${key}"="${value}"](around:${radiusM},${lat},${lng});`
  );
  return `[out:json][timeout:25];\n(\n${[...nodeLines, ...wayLines].join("\n")}\n);\nout center body;`;
}

function distanciaM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatEndereco(tags: Record<string, string>): string {
  const partes = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:suburb"] ?? tags["addr:neighbourhood"] ?? tags["addr:city"],
  ].filter(Boolean);
  return partes.length ? partes.join(", ") : "Brasília, DF";
}

function detectCategoria(
  tags: Record<string, string>,
  solicitadas: string[]
): string {
  for (const cat of solicitadas) {
    const catTags = CATEGORY_TAGS[cat] ?? [];
    if (catTags.some(({ key, value }) => tags[key] === value)) return cat;
  }
  return solicitadas[0] ?? "outros";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapElement(el: any, categorias: string[], userLat: number, userLng: number): Place | null {
  if (!el.tags?.name) return null;
  const elLat: number = el.lat ?? el.center?.lat ?? 0;
  const elLng: number = el.lon ?? el.center?.lon ?? 0;
  if (!elLat || !elLng) return null;

  const cat = detectCategoria(el.tags, categorias);
  const meta = CATEGORIA_META[cat] ?? { label: cat, emoji: "📍", cor: "from-gray-400 to-gray-600" };

  return {
    id: String(el.id),
    nome: el.tags.name,
    categoria: cat,
    categoriaLabel: meta.label,
    emoji: meta.emoji,
    cor: meta.cor,
    lat: elLat,
    lng: elLng,
    endereco: formatEndereco(el.tags),
    telefone: el.tags["contact:phone"] ?? el.tags.phone,
    website: el.tags.website ?? el.tags["contact:website"],
    horario: el.tags.opening_hours,
    distanciaM: distanciaM(userLat, userLng, elLat, elLng),
  };
}

export async function fetchPlaces(
  categorias: string[],
  lat: number,
  lng: number,
  radiusM = 10000,
  limit = 40
): Promise<Place[]> {
  const tags = categorias.flatMap((cat) => CATEGORY_TAGS[cat] ?? []);
  if (tags.length === 0) return [];

  const query = buildOverpassQuery(lat, lng, radiusM, categorias);

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);

  const data = await res.json();

  return (data.elements as unknown[])
    .map((el) => mapElement(el as Record<string, unknown>, categorias, lat, lng))
    .filter((p): p is Place => p !== null)
    .sort((a, b) => (a.distanciaM ?? 0) - (b.distanciaM ?? 0))
    .slice(0, limit);
}

export function formatDistancia(metros: number): string {
  if (metros < 1000) return `${metros}m`;
  return `${(metros / 1000).toFixed(1)}km`;
}
