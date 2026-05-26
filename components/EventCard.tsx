import Link from "next/link";
import type { Evento } from "@/lib/data";

export default function EventCard({ evento }: { evento: Evento }) {
  return (
    <Link href={`/evento/${evento.id}`} className="block">
      <div className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-violet-100 flex gap-0">
        <div className={`bg-gradient-to-br ${evento.cor} w-24 flex-shrink-0 flex items-center justify-center`}>
          <span className="text-4xl">{evento.emoji}</span>
        </div>
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              {evento.categoriaLabel}
            </span>
            <span className="text-[11px] text-gray-400 flex-shrink-0">{evento.hora}</span>
          </div>
          <h3 className="font-bold text-gray-900 mt-1 text-sm leading-snug line-clamp-2">
            {evento.titulo}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            📍 {evento.local}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold text-amber-600">
              {evento.data}
            </span>
            <span className={`text-xs font-bold ${evento.preco === "Gratuito" ? "text-green-600" : "text-violet-700"}`}>
              {evento.preco}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
