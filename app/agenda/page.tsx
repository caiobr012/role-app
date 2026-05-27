"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CalendarCheck, Trash2, MapPin, Clock, Plus } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getAgendamentos, removeAgendamento, getUser, syncToCloud } from "@/lib/storage";
import type { Agendamento } from "@/lib/storage";

function isUpcoming(ag: Agendamento): boolean {
  const d = new Date(ag.fullDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

function AgendaCard({
  ag,
  onCancel,
  past,
}: {
  ag: Agendamento;
  onCancel: (id: string) => void;
  past?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm ${past ? "opacity-60" : ""}`}>
      <div className={`h-1 bg-gradient-to-r ${ag.placeColor || "from-violet-500 to-indigo-500"}`} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 flex-shrink-0">{ag.placeEmoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-snug">{ag.placeName}</p>
            <span className="inline-block text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1">
              {ag.placeCategoryLabel}
            </span>
            {ag.placeAddress && (
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-400 truncate">{ag.placeAddress}</p>
              </div>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs font-bold text-violet-600">
                <CalendarCheck size={11} /> {ag.dateLabel}, {ag.dateSub}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} /> {ag.time}
              </span>
            </div>
          </div>
          {!past && (
            <button
              onClick={() => onCancel(ag.id)}
              className="w-9 h-9 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors active:scale-90"
            >
              <Trash2 size={15} className="text-red-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [userName, setUserName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAgendamentos(getAgendamentos());
    const u = getUser();
    if (u) setUserName(u.nome);
    setHydrated(true);
  }, []);

  async function cancel(id: string) {
    removeAgendamento(id);
    setAgendamentos(getAgendamentos());
    const u = getUser();
    if (u) await syncToCloud(u.nome);
  }

  if (!hydrated) return null;

  const upcoming = agendamentos
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const past = agendamentos
    .filter((a) => !isUpcoming(a))
    .sort((a, b) => new Date(b.fullDate).getTime() - new Date(a.fullDate).getTime());

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">
              {userName ? `Rolês de ${userName}` : "Minha agenda"}
            </p>
            <h1 className="text-base font-bold text-gray-900">Agenda</h1>
          </div>
          {upcoming.length > 0 && (
            <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {upcoming.length} próximo{upcoming.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-6">
        {agendamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
              <CalendarCheck size={28} className="text-violet-400" />
            </div>
            <h2 className="font-bold text-gray-900">Nenhum rolê agendado</h2>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Marque um rolê nos lugares que você<br />encontrar ao descobrir
            </p>
            <Link
              href="/"
              className="mt-5 bg-violet-600 text-white font-semibold px-5 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <Plus size={15} /> Descobrir lugares
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Próximos · {upcoming.length}
                </p>
                <div className="space-y-3">
                  {upcoming.map((ag) => (
                    <AgendaCard key={ag.id} ag={ag} onCancel={cancel} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Passados · {past.length}
                </p>
                <div className="space-y-3">
                  {past.map((ag) => (
                    <AgendaCard key={ag.id} ag={ag} onCancel={cancel} past />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
