"use client";

import { useState } from "react";
import PlaceCard from "./PlaceCard";
import PlaceScheduler from "./PlaceScheduler";
import type { PlaceEx } from "@/lib/campo-grande";

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
  grouped: Record<string, PlaceEx[]>;
}

export default function PlacesWithScheduler({ grouped }: Props) {
  const [scheduling, setScheduling] = useState<PlaceEx | null>(null);

  return (
    <>
      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {CAT_LABEL[cat] ?? cat}
          </h2>
          <div className="space-y-3">
            {items.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onSchedule={(p) => setScheduling(p)}
              />
            ))}
          </div>
        </section>
      ))}

      {scheduling && (
        <PlaceScheduler
          place={scheduling}
          onClose={() => setScheduling(null)}
        />
      )}
    </>
  );
}
