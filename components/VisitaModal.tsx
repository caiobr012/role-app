"use client";

import { useState, useRef, useEffect } from "react";
import { X, Star, Camera, Check, Loader2, Trash2 } from "lucide-react";
import type { PlaceEx } from "@/lib/campo-grande";
import { addVisita, syncToCloud, getUser } from "@/lib/storage";

// ── Redimensiona imagem via canvas ────────────────────────────────────────────

async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onerror = reject;
      img.onload = () => {
        const MAX = 480;
        let { width: w, height: h } = img;
        if (w > h) {
          if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        } else {
          if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.55));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  place: PlaceEx;
  onClose: () => void;
}

export default function VisitaModal({ place, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotoLoading(true);
    try {
      const resized = await Promise.all(files.slice(0, 3).map(resizeImage));
      setFotos((prev) => [...prev, ...resized].slice(0, 3));
    } catch {
      // ignora erros de imagem
    } finally {
      setPhotoLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removePhoto(idx: number) {
    setFotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!rating) return;
    setSaving(true);
    addVisita({
      placeId: place.id,
      placeName: place.nome,
      placeAddress: place.endereco ?? "",
      placeCategory: place.categoria,
      placeCategoryLabel: place.categoriaLabel,
      placeEmoji: place.emoji,
      placeColor: place.cor,
      rating,
      review: review.trim(),
      fotos,
    });
    const user = getUser();
    if (user) await syncToCloud(user.nome);
    setSaving(false);
    setSaved(true);
  }

  const displayRating = hoverRating || rating;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {saved ? (
          // ── Tela de confirmação ───────────────────────────────────────────
          <div className="px-5 pb-10 pt-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-emerald-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Visita registrada!</h2>
            <p className="text-gray-500 text-sm mt-1">Sua avaliação foi salva.</p>
            <div className="bg-emerald-50 rounded-xl p-4 mt-4 w-full text-left">
              <p className="font-bold text-gray-900 text-sm">{place.nome}</p>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                ))}
              </div>
              {review && <p className="text-xs text-gray-500 mt-2 leading-relaxed">&ldquo;{review}&rdquo;</p>}
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 bg-violet-600 text-white py-3.5 rounded-xl text-sm font-bold"
            >
              Fechar
            </button>
          </div>
        ) : (
          // ── Formulário ────────────────────────────────────────────────────
          <div className="px-5 pb-8">
            <div className="flex items-start justify-between mb-5 mt-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">Avaliar visita a</p>
                <h2 className="font-bold text-gray-900 text-base leading-tight mt-0.5 pr-6 line-clamp-2">
                  {place.nome}
                </h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            {/* Rating */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Como foi?</p>
            <div className="flex gap-3 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      s <= displayRating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-xs text-gray-400 -mt-2 mb-4">
                {["", "Horrível 😞", "Ruim 😕", "Ok 😐", "Bom 😊", "Excelente! 🤩"][displayRating]}
              </p>
            )}

            {/* Review */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Conta um pouco</p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="O que você achou do lugar? (opcional)"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 resize-none"
            />

            {/* Fotos */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4 mb-3">Fotos</p>

            {fotos.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {fotos.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />

            {fotos.length < 3 && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoLoading}
                className="flex items-center gap-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-4 py-2.5 rounded-xl"
              >
                {photoLoading
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Camera size={15} />}
                {photoLoading ? "Processando..." : "Adicionar foto"}
              </button>
            )}

            {/* Botão salvar */}
            <button
              onClick={handleSave}
              disabled={!rating || saving}
              className={`w-full mt-5 font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
                rating && !saving
                  ? "bg-amber-400 text-gray-900"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Salvando..." : "Salvar avaliação"}
            </button>

            {!rating && (
              <p className="text-xs text-gray-400 text-center mt-2">Selecione ao menos uma estrela</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
