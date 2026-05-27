"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Star, Trash2, MapPin, Plus, Camera } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import VisitaModal from "@/components/VisitaModal";
import { getVisitas, removeVisita, getUser, syncToCloud } from "@/lib/storage";
import type { Visita } from "@/lib/storage";
import type { PlaceEx } from "@/lib/campo-grande";

// ── Card de visita ────────────────────────────────────────────────────────────

function VisitaCard({ visita, onDelete }: { visita: Visita; onDelete: (id: string) => void }) {
  const date = new Date(visita.criadoEm).toLocaleDateString("pt-BR", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className={`h-1 bg-gradient-to-r ${visita.placeColor || "from-violet-500 to-indigo-500"}`} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 flex-shrink-0">{visita.placeEmoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-snug">{visita.placeName}</p>
            <span className="inline-block text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-0.5">
              {visita.placeCategoryLabel}
            </span>

            {/* Estrelas */}
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={s <= visita.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                />
              ))}
            </div>

            {/* Review */}
            {visita.review && (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">
                &ldquo;{visita.review}&rdquo;
              </p>
            )}

            {/* Fotos */}
            {visita.fotos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {visita.fotos.map((src, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {visita.placeAddress && (
              <div className="flex items-center gap-1 mt-2">
                <MapPin size={11} className="text-gray-300 flex-shrink-0" />
                <p className="text-[11px] text-gray-400 truncate">{visita.placeAddress}</p>
              </div>
            )}

            <p className="text-[11px] text-gray-300 mt-1">{date}</p>
          </div>

          <button
            onClick={() => onDelete(visita.id)}
            className="w-9 h-9 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors active:scale-90"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de adicionar visita manual ─────────────────────────────────────────

function AddManualButton({ onAdd }: { onAdd: (p: PlaceEx) => void }) {
  const [open, setOpen] = useState(false);
  const [nomeLugar, setNomeLugar] = useState("");

  function handleOpen() { setOpen(true); setNomeLugar(""); }
  function handleClose() { setOpen(false); }

  function handleSubmit() {
    if (!nomeLugar.trim()) return;
    const place: PlaceEx = {
      id: `manual-${Date.now()}`,
      nome: nomeLugar.trim(),
      categoria: "restaurantes",
      categoriaLabel: "Lugar",
      emoji: "📍",
      cor: "from-violet-500 to-indigo-500",
      lat: -20.4697,
      lng: -54.6201,
      endereco: "",
    };
    setOpen(false);
    onAdd(place);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
      >
        <Plus size={15} /> Adicionar visita
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={handleClose} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-2xl p-5 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Qual lugar você visitou?</h3>
            <p className="text-xs text-gray-400 mb-4">Digite o nome do lugar para continuar</p>
            <input
              type="text"
              autoFocus
              value={nomeLugar}
              onChange={(e) => setNomeLugar(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="Ex: Churrascaria do Zé, Bar da Maria..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
            <button
              onClick={handleSubmit}
              disabled={!nomeLugar.trim()}
              className={`w-full mt-3 py-3.5 rounded-xl font-bold text-sm ${
                nomeLugar.trim() ? "bg-amber-400 text-gray-900" : "bg-gray-100 text-gray-400"
              }`}
            >
              Continuar →
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────────

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [userName, setUserName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [addingPlace, setAddingPlace] = useState<PlaceEx | null>(null);

  useEffect(() => {
    setVisitas(getVisitas());
    const u = getUser();
    if (u) setUserName(u.nome);
    setHydrated(true);
  }, []);

  async function handleDelete(id: string) {
    removeVisita(id);
    setVisitas(getVisitas());
    const u = getUser();
    if (u) await syncToCloud(u.nome);
  }

  function handleVisitaSaved() {
    setAddingPlace(null);
    setVisitas(getVisitas());
  }

  if (!hydrated) return null;

  const sorted = [...visitas].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );

  // Métricas rápidas
  const avgRating = visitas.length
    ? (visitas.reduce((s, v) => s + v.rating, 0) / visitas.length).toFixed(1)
    : null;
  const withPhotos = visitas.filter((v) => v.fotos.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">
              {userName ? `Lugares de ${userName}` : "Meus lugares"}
            </p>
            <h1 className="text-base font-bold text-gray-900">Visitas</h1>
          </div>
          <AddManualButton onAdd={setAddingPlace} />
        </div>
      </div>

      {/* Métricas rápidas */}
      {visitas.length > 0 && (
        <div className="px-4 pt-4 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
            <p className="text-2xl font-black text-violet-600">{visitas.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Visitas</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
            <p className="text-2xl font-black text-amber-500">{avgRating ?? "—"}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium flex items-center justify-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" /> Média
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
            <p className="text-2xl font-black text-emerald-600">{withPhotos}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-medium flex items-center justify-center gap-0.5">
              <Camera size={10} /> Com foto
            </p>
          </div>
        </div>
      )}

      <div className="px-4 mt-4 space-y-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Star size={28} className="text-emerald-400" />
            </div>
            <h2 className="font-bold text-gray-900">Nenhuma visita ainda</h2>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Quando você visitar um lugar, toque em<br />&ldquo;Fui aqui&rdquo; para registrar sua avaliação
            </p>
            <Link
              href="/"
              className="mt-5 bg-violet-600 text-white font-semibold px-5 py-3 rounded-xl text-sm"
            >
              Descobrir lugares
            </Link>
          </div>
        ) : (
          sorted.map((v) => (
            <VisitaCard key={v.id} visita={v} onDelete={handleDelete} />
          ))
        )}
      </div>

      {addingPlace && (
        <VisitaModal
          place={addingPlace}
          onClose={handleVisitaSaved}
        />
      )}

      <BottomNav />
    </div>
  );
}
