"use client";

import { useEffect, useState } from "react";
import type { Place } from "@/lib/overpass";
import PlaceCard from "./PlaceCard";

interface Props {
  cats: string[];
  lat: number;
  lng: number;
  curadosIds: string[];
}

export default function OverpassEnhancer({ cats, lat, lng, curadosIds }: Props) {
  const [extras, setExtras] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      try {
        const url = `/api/places?categorias=${cats.join(",")}&lat=${lat}&lng=${lng}`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = await res.json();
        const places: Place[] = (data.places ?? []).filter(
          (p: Place) => !curadosIds.includes(p.id)
        );
        setExtras(places);
      } catch {
        // silencia — dados curados já estão visíveis
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
        <span className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
        Buscando mais lugares no mapa...
      </div>
    );
  }

  if (!extras.length) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Mais lugares próximos
      </h2>
      <div className="space-y-2">
        {extras.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
