import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Heart } from "lucide-react";

export default function FavoritosPage() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-24 max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <h1 className="text-white font-bold text-lg">Salvos</h1>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-4">
          <Heart size={36} className="text-violet-400" />
        </div>
        <h2 className="font-bold text-gray-800 text-lg">Nenhum favorito ainda</h2>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          Salve eventos para não perder nada. Basta tocar no coração ❤️ na página do evento.
        </p>
        <Link href="/" className="mt-6 bg-violet-600 text-white font-semibold px-6 py-3 rounded-2xl">
          Descobrir eventos
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
