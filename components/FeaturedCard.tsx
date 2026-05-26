import Link from "next/link";
import type { Evento } from "@/lib/data";

export default function FeaturedCard({ evento }: { evento: Evento }) {
  return (
    <Link href={`/evento/${evento.id}`} className="block flex-shrink-0 w-56">
      <div className="card-hover rounded-2xl overflow-hidden shadow-md h-full">
        <div className={`bg-gradient-to-br ${evento.cor} h-36 flex items-center justify-center relative`}>
          <span className="text-6xl">{evento.emoji}</span>
          <div className="absolute bottom-2 left-2">
            <span className="text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm px-2 py-0.5 rounded-full">
              {evento.categoriaLabel}
            </span>
          </div>
          {evento.preco === "Gratuito" && (
            <div className="absolute top-2 right-2">
              <span className="text-[11px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                GRÁTIS
              </span>
            </div>
          )}
        </div>
        <div className="bg-white p-3">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
            {evento.titulo}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">📍 {evento.local}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold text-amber-600">{evento.data} · {evento.hora}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
