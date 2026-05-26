"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, ChevronLeft, Loader2, LocateFixed } from "lucide-react";

const DATE_OPTIONS = [
  { id: "hoje",     label: "Hoje",          sub: "Agora mesmo",      emoji: "🔥" },
  { id: "amanha",   label: "Amanhã",        sub: "Planejando adiantado", emoji: "📅" },
  { id: "fds",      label: "Fim de semana", sub: "Sábado ou domingo", emoji: "🎉" },
  { id: "semana",   label: "Esta semana",   sub: "Qualquer dia",      emoji: "📆" },
];

const CATEGORY_OPTIONS = [
  { id: "bares",        emoji: "🍺", label: "Bares & Botecos"   },
  { id: "restaurantes", emoji: "🍽️", label: "Restaurantes"      },
  { id: "parques",      emoji: "🌿", label: "Parques & Natureza" },
  { id: "cultura",      emoji: "🎭", label: "Teatro & Cinema"   },
  { id: "museus",       emoji: "🏛️", label: "Museus"            },
  { id: "shows",        emoji: "🎵", label: "Shows & Música"    },
  { id: "feiras",       emoji: "🛍️", label: "Feiras"            },
  { id: "esportes",     emoji: "⚽", label: "Esportes"          },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function WizardHome() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quando, setQuando] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [lat, setLat] = useState(-15.7801);
  const [lng, setLng] = useState(-47.9292);
  const [locLabel, setLocLabel] = useState("Brasília, DF");
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    // Tenta geolocalização silenciosamente ao carregar
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocLabel("Localização atual");
        },
        () => { /* sem permissão, usa Brasília */ },
        { timeout: 5000 }
      );
    }
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocLabel("Localização atual");
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { timeout: 8000 }
    );
  }

  function toggleCategoria(id: string) {
    setCategorias((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleBuscar() {
    const cats = categorias.length > 0 ? categorias : CATEGORY_OPTIONS.map((c) => c.id);
    const params = new URLSearchParams({
      quando,
      categorias: cats.join(","),
      lat: String(lat),
      lng: String(lng),
    });
    router.push(`/descobrir?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] max-w-lg mx-auto flex flex-col">
      {/* Header fixo */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xl font-black text-white tracking-tight">rolê</span>
          <button
            onClick={requestLocation}
            className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs text-white font-medium"
          >
            {locLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <LocateFixed size={12} />
            )}
            <span>{locLabel}</span>
          </button>
        </div>
        <p className="text-violet-200 text-sm mt-2">{getGreeting()} 👋 Vamos marcar um rolê?</p>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-all ${
                n <= step ? "bg-amber-400" : "bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo do step */}
      <div className="flex-1 px-4 py-6">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Quando você quer sair?</h2>
            <p className="text-gray-500 text-sm mb-5">Escolha o melhor momento pro rolê</p>
            <div className="grid grid-cols-2 gap-3">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setQuando(opt.id)}
                  className={`rounded-2xl p-4 text-left transition-all border-2 ${
                    quando === opt.id
                      ? "border-violet-600 bg-violet-50 shadow-md shadow-violet-100"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <p className="font-bold text-gray-900 mt-2 text-sm">{opt.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">O que vocês querem fazer?</h2>
            <p className="text-gray-500 text-sm mb-5">
              Pode marcar mais de uma opção
              {categorias.length > 0 && (
                <span className="ml-1 font-semibold text-violet-600">
                  ({categorias.length} selecionado{categorias.length > 1 ? "s" : ""})
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((opt) => {
                const sel = categorias.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleCategoria(opt.id)}
                    className={`rounded-2xl p-4 text-left transition-all border-2 ${
                      sel
                        ? "border-violet-600 bg-violet-50 shadow-md shadow-violet-100"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <p className={`font-bold mt-2 text-sm ${sel ? "text-violet-700" : "text-gray-900"}`}>
                      {opt.label}
                    </p>
                    {sel && (
                      <span className="inline-block mt-1 w-4 h-4 bg-violet-600 rounded-full text-white text-[10px] flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Botões de navegação */}
      <div className="px-4 pb-10 flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-12 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        )}

        {step === 1 && (
          <button
            disabled={!quando}
            onClick={() => setStep(2)}
            className={`flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              quando
                ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Próximo <ChevronRight size={20} />
          </button>
        )}

        {step === 2 && (
          <button
            onClick={handleBuscar}
            className="flex-1 h-14 rounded-2xl bg-amber-400 text-violet-900 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
          >
            {categorias.length > 0
              ? `Ver opções de rolê (${categorias.length})`
              : "Ver todas as opções"}{" "}
            🚀
          </button>
        )}
      </div>
    </div>
  );
}
