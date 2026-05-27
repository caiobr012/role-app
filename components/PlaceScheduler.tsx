"use client";

import { useState, useEffect } from "react";
import { X, Share2, Check, CalendarCheck } from "lucide-react";
import type { PlaceEx } from "@/lib/campo-grande";
import { addAgendamento, syncToCloud, getUser } from "@/lib/storage";

// ── Geração de opções de data ─────────────────────────────────────────────────

interface DateOpt { id: string; label: string; sub: string; date: Date }

function buildDateOptions(): DateOpt[] {
  const opts: DateOpt[] = [];
  const today = new Date();
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    opts.push({
      id: String(i),
      label: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : weekdays[d.getDay()],
      sub: `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}`,
      date: d,
    });
  }
  return opts;
}

const TIMES = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  "21:00", "22:00", "23:00",
];

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  place: PlaceEx;
  onClose: () => void;
}

export default function PlaceScheduler({ place, onClose }: Props) {
  const dates = buildDateOptions();
  const [dateId, setDateId] = useState(dates[0].id);
  const [time, setTime] = useState("19:00");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const selectedDate = dates.find((d) => d.id === dateId)!;
  const dateStr = `${selectedDate.label}, ${selectedDate.sub}`;

  async function handleConfirm() {
    addAgendamento({
      placeName: place.nome,
      placeAddress: place.endereco ?? "",
      placeCategory: place.categoria,
      placeCategoryLabel: place.categoriaLabel,
      placeEmoji: place.emoji,
      placeColor: place.cor,
      dateLabel: selectedDate.label,
      dateSub: selectedDate.sub,
      time,
      fullDate: selectedDate.date.toISOString(),
    });
    const user = getUser();
    if (user) await syncToCloud(user.nome);
    setConfirmed(true);
  }

  function handleShare() {
    const text = `Vem comigo! Rolê marcado: ${place.nome} — ${dateStr} às ${time} em Campo Grande, MS`;
    if (navigator.share) {
      navigator.share({ title: "Rolê marcado!", text });
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {!confirmed ? (
          <div className="px-5 pb-8">
            <div className="flex items-start justify-between mb-5 mt-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">Marcar rolê em</p>
                <h2 className="font-bold text-gray-900 text-base leading-tight mt-0.5 pr-6 line-clamp-2">
                  {place.nome}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Qual dia?</p>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {dates.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateId(d.id)}
                  className={`flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all min-w-[58px] ${
                    dateId === d.id
                      ? "border-violet-600 bg-violet-50 text-violet-700"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  <span className={`text-[11px] font-medium ${dateId === d.id ? "text-violet-500" : "text-gray-400"}`}>
                    {d.label}
                  </span>
                  <span className="font-bold text-sm mt-0.5">{d.sub}</span>
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-5 mb-2">Que horas?</p>
            <div className="grid grid-cols-5 gap-2">
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    time === t
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mt-5 flex items-center gap-3">
              <CalendarCheck size={18} className="text-violet-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Resumo do rolê</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{place.nome}</p>
                <p className="text-xs text-violet-600 font-medium">{dateStr} às {time}</p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full mt-4 bg-amber-400 text-gray-900 font-bold py-4 rounded-xl text-sm"
            >
              Confirmar rolê
            </button>
          </div>
        ) : (
          <div className="px-5 pb-10 pt-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-green-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Rolê marcado!</h2>
            <p className="text-gray-500 text-sm mt-1">Não perde esse.</p>

            <div className="bg-violet-50 rounded-xl p-4 mt-5 w-full text-left">
              <p className="font-semibold text-gray-900 text-sm">{place.nome}</p>
              <p className="text-xs text-gray-500 mt-0.5">{place.endereco}</p>
              <p className="text-violet-600 font-semibold text-sm mt-2">{dateStr} às {time}</p>
            </div>

            <div className="flex gap-3 mt-5 w-full">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-700"
              >
                <Share2 size={16} /> Compartilhar
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-violet-600 text-white py-3 rounded-xl text-sm font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
