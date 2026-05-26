"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flame, CalendarDays, CalendarRange, Calendar,
  Beer, UtensilsCrossed, TreePine, Drama,
  Landmark, Music, ShoppingBag, Trophy,
  ChevronRight, ChevronLeft, LocateFixed, Loader2, MapPin,
} from "lucide-react";

// ── tipos ───────────────────────────────────────────────────────────────────

interface DateOption {
  id: string;
  label: string;
  sub: string;
  Icon: React.ElementType;
}

interface CatOption {
  id: string;
  label: string;
  Icon: React.ElementType;
}

// ── dados ───────────────────────────────────────────────────────────────────

const DATE_OPTIONS: DateOption[] = [
  { id: "hoje",    label: "Hoje",           sub: "Agora mesmo",           Icon: Flame        },
  { id: "amanha",  label: "Amanhã",         sub: "Planejando adiantado",  Icon: CalendarDays  },
  { id: "fds",     label: "Fim de semana",  sub: "Sábado ou domingo",     Icon: CalendarRange },
  { id: "semana",  label: "Esta semana",    sub: "Qualquer dia",          Icon: Calendar      },
];

const CAT_OPTIONS: CatOption[] = [
  { id: "bares",        label: "Bares",       Icon: Beer            },
  { id: "restaurantes", label: "Restaurantes",Icon: UtensilsCrossed },
  { id: "parques",      label: "Parques",     Icon: TreePine        },
  { id: "cultura",      label: "Cultura",     Icon: Drama           },
  { id: "museus",       label: "Museus",      Icon: Landmark        },
  { id: "shows",        label: "Shows",       Icon: Music           },
  { id: "feiras",       label: "Feiras",      Icon: ShoppingBag     },
  { id: "esportes",     label: "Esportes",    Icon: Trophy          },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// ── componente ───────────────────────────────────────────────────────────────

export default function WizardHome() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [quando, setQuando] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [lat, setLat] = useState(-20.4697);
  const [lng, setLng] = useState(-54.6201);
  const [locLabel, setLocLabel] = useState("Campo Grande, MS");
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => { setLat(p.coords.latitude); setLng(p.coords.longitude); setLocLabel("Localização atual"); },
      () => {},
      { timeout: 5000 }
    );
  }, []);

  function requestLoc() {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLat(p.coords.latitude); setLng(p.coords.longitude); setLocLabel("Localização atual"); setLocLoading(false); },
      () => setLocLoading(false),
      { timeout: 8000 }
    );
  }

  function toggle(id: string) {
    setCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  function go() {
    const selected = cats.length ? cats : CAT_OPTIONS.map((c) => c.id);
    router.push(`/descobrir?quando=${quando}&categorias=${selected.join(",")}&lat=${lat}&lng=${lng}`);
  }

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto flex flex-col">
      {/* cabeçalho */}
      <div className="px-5 pt-14 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-violet-600 tracking-tight">rolê</span>
          <button
            onClick={requestLoc}
            className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"
          >
            {locLoading ? <Loader2 size={13} className="animate-spin text-violet-500" /> : <MapPin size={13} className="text-violet-500" />}
            {locLabel}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-3">{greeting()}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">
          {step === 1 ? "Quando você quer sair?" : "O que você quer fazer?"}
        </h1>

        {/* barra de progresso */}
        <div className="flex gap-1.5 mt-4">
          {[1, 2].map((n) => (
            <div key={n} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${n <= step ? "bg-violet-600" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>

      {/* conteúdo */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {DATE_OPTIONS.map(({ id, label, sub, Icon }) => {
              const active = quando === id;
              return (
                <button
                  key={id}
                  onClick={() => setQuando(id)}
                  className={`rounded-xl p-4 text-left border transition-all ${
                    active
                      ? "border-violet-600 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${active ? "bg-violet-600" : "bg-gray-100"}`}>
                    <Icon size={18} className={active ? "text-white" : "text-gray-500"} />
                  </div>
                  <p className={`font-semibold text-sm ${active ? "text-violet-700" : "text-gray-800"}`}>{label}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug">{sub}</p>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div>
            {cats.length > 0 && (
              <p className="text-xs text-violet-600 font-medium mb-4">
                {cats.length} selecionado{cats.length > 1 ? "s" : ""} — ou deixe em branco para ver tudo
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {CAT_OPTIONS.map(({ id, label, Icon }) => {
                const active = cats.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className={`rounded-xl p-4 text-left border transition-all ${
                      active
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${active ? "bg-violet-600" : "bg-gray-100"}`}>
                      <Icon size={18} className={active ? "text-white" : "text-gray-500"} />
                    </div>
                    <p className={`font-semibold text-sm ${active ? "text-violet-700" : "text-gray-800"}`}>{label}</p>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* rodapé de ação */}
      <div className="px-5 pb-10 pt-3 border-t border-gray-100 flex gap-3">
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {step === 1 ? (
          <button
            disabled={!quando}
            onClick={() => setStep(2)}
            className={`flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              quando
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Próximo <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={go}
            className="flex-1 h-12 rounded-xl bg-amber-400 text-gray-900 font-semibold text-sm flex items-center justify-center gap-2"
          >
            {cats.length
              ? `Ver opções (${cats.length} categorias)`
              : "Ver todas as opções"
            }
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
