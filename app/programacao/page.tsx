import Link from "next/link";
import { eventos } from "@/lib/data";
import EventCard from "@/components/EventCard";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";

const hoje = eventos.filter((e) => e.data === "Hoje");
const amanha = eventos.filter((e) => e.data === "Amanhã");
const semana = eventos.filter((e) => e.data === "Esta semana");

export default function ProgramacaoPage() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-24 max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <h1 className="text-white font-bold text-lg">Programação</h1>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-6">
        {hoje.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">🔥 Hoje</h2>
            <div className="space-y-3">
              {hoje.map((e) => <EventCard key={e.id} evento={e} />)}
            </div>
          </section>
        )}
        {amanha.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">📅 Amanhã</h2>
            <div className="space-y-3">
              {amanha.map((e) => <EventCard key={e.id} evento={e} />)}
            </div>
          </section>
        )}
        {semana.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-900 text-base mb-3">📆 Esta Semana</h2>
            <div className="space-y-3">
              {semana.map((e) => <EventCard key={e.id} evento={e} />)}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
