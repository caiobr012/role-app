import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventoById, eventos } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, MapPin, Clock, Calendar, Tag, Share2, Heart } from "lucide-react";

export function generateStaticParams() {
  return eventos.map((e) => ({ id: e.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventoPage({ params }: Props) {
  const { id } = await params;
  const evento = getEventoById(id);
  if (!evento) notFound();

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-24 max-w-lg mx-auto">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${evento.cor} relative`}>
        <div className="flex items-center justify-between px-4 pt-12 pb-4">
          <Link href="/" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <div className="flex gap-2">
            <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart size={18} className="text-white" />
            </button>
            <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Share2 size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center pb-10 pt-4">
          <span className="text-8xl mb-4">{evento.emoji}</span>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            {evento.categoriaLabel}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#F5F3FF] rounded-t-3xl" />
      </div>

      {/* Content */}
      <div className="px-4 -mt-2 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{evento.titulo}</h1>
          <div className="flex items-center gap-1 mt-2">
            <MapPin size={14} className="text-violet-500 flex-shrink-0" />
            <p className="text-sm text-gray-600">{evento.local} — {evento.cidade}</p>
          </div>
        </div>

        {/* Info chips */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-violet-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Data</p>
              <p className="text-sm font-bold text-gray-800">{evento.data}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Horário</p>
              <p className="text-sm font-bold text-gray-800">{evento.hora}</p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-1">Ingresso / Entrada</p>
          <p className={`text-xl font-bold ${evento.preco === "Gratuito" ? "text-green-600" : "text-violet-700"}`}>
            {evento.preco}
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-2">Sobre o evento</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{evento.descricao}</p>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin size={16} className="text-violet-500" /> Local
          </h2>
          <p className="text-sm font-semibold text-gray-800">{evento.local}</p>
          <p className="text-sm text-gray-500">{evento.endereco}</p>
          <p className="text-sm text-gray-500">{evento.cidade}</p>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Tag size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {evento.tags.map((tag) => (
              <span key={tag} className="bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pb-4">
          <button className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-200 active:scale-95 transition-transform">
            Quero ir! 🎉
          </button>
          <button className="w-full mt-3 text-violet-600 font-semibold py-3 rounded-2xl border-2 border-violet-200 active:scale-95 transition-transform">
            Ver no Mapa
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
