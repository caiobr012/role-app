"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Flame, CalendarDays, CalendarRange, Calendar,
  Beer, UtensilsCrossed, TreePine, Drama,
  Landmark, Music, ShoppingBag, Trophy,
  ChevronRight, ChevronLeft, Loader2, MapPin,
  Sparkles, CalendarCheck, X, Wand2, Zap,
  RefreshCw, Copy, Check, CloudOff, Cloud, ClipboardPaste,
} from "lucide-react";
import {
  getUser, saveUser, getAgendamentos,
  loadFromCloud, mergeCloudData, syncToCloud,
  migrateToNamed, exportSyncCode, importSyncCode, checkCloudConfigured,
} from "@/lib/storage";
import type { RoleUser, Agendamento } from "@/lib/storage";
import BottomNav from "./BottomNav";

// ── constantes ────────────────────────────────────────────────────────────────

const DATE_OPTIONS = [
  { id: "hoje",   label: "Hoje",           sub: "Agora mesmo",          Icon: Flame         },
  { id: "amanha", label: "Amanhã",         sub: "Planejando adiantado",  Icon: CalendarDays  },
  { id: "fds",    label: "Fim de semana",  sub: "Sábado ou domingo",     Icon: CalendarRange },
  { id: "semana", label: "Esta semana",    sub: "Qualquer dia",          Icon: Calendar      },
];

const CAT_OPTIONS = [
  { id: "bares",        label: "Bares",        Icon: Beer,            bg: "bg-amber-100",   color: "text-amber-600"   },
  { id: "restaurantes", label: "Restaurantes",  Icon: UtensilsCrossed, bg: "bg-orange-100",  color: "text-orange-600"  },
  { id: "parques",      label: "Parques",       Icon: TreePine,        bg: "bg-emerald-100", color: "text-emerald-600" },
  { id: "cultura",      label: "Cultura",       Icon: Drama,           bg: "bg-purple-100",  color: "text-purple-600"  },
  { id: "museus",       label: "Museus",        Icon: Landmark,        bg: "bg-yellow-100",  color: "text-yellow-600"  },
  { id: "shows",        label: "Shows",         Icon: Music,           bg: "bg-violet-100",  color: "text-violet-600"  },
  { id: "feiras",       label: "Feiras",        Icon: ShoppingBag,     bg: "bg-pink-100",    color: "text-pink-600"    },
  { id: "esportes",     label: "Esportes",      Icon: Trophy,          bg: "bg-teal-100",    color: "text-teal-600"    },
];

const DIY_COMIDA = [
  { id: "pizza",      label: "Pizza",      emoji: "🍕", cats: ["restaurantes"] },
  { id: "hamburguer", label: "Hambúrguer", emoji: "🍔", cats: ["restaurantes"] },
  { id: "sushi",      label: "Sushi",      emoji: "🍣", cats: ["restaurantes"] },
  { id: "churrasco",  label: "Churrasco",  emoji: "🥩", cats: ["restaurantes"] },
  { id: "mexicana",   label: "Mexicana",   emoji: "🌮", cats: ["restaurantes"] },
  { id: "brasileira", label: "Brasileira", emoji: "🫘", cats: ["restaurantes"] },
];

const DIY_BEBIDA = [
  { id: "cerveja", label: "Cerveja", emoji: "🍺", cats: ["bares"] },
  { id: "drink",   label: "Drink",   emoji: "🍹", cats: ["bares"] },
  { id: "vinho",   label: "Vinho",   emoji: "🍷", cats: ["restaurantes"] },
  { id: "cafe",    label: "Café",    emoji: "☕", cats: ["cultura"] },
  { id: "suco",    label: "Natural", emoji: "🥤", cats: ["parques", "feiras"] },
];

const DIY_ATIVIDADE = [
  { id: "cinema",         label: "Cinema",         emoji: "🎬", cats: ["cultura"] },
  { id: "musica_ao_vivo", label: "Música ao vivo", emoji: "🎸", cats: ["shows", "bares"] },
  { id: "role_carro",     label: "Rolê de carro",  emoji: "🚗", cats: ["parques"] },
  { id: "role_moto",      label: "Rolê de moto",   emoji: "🏍️", cats: ["parques"] },
  { id: "dar_risada",     label: "Dar risada",     emoji: "😂", cats: ["shows", "bares"] },
  { id: "dancar",         label: "Dançar",         emoji: "💃", cats: ["bares", "shows"] },
  { id: "karaoke",        label: "Karaokê",        emoji: "🎤", cats: ["bares"] },
  { id: "passear",        label: "Passear",        emoji: "🚶", cats: ["parques"] },
  { id: "teatro",         label: "Teatro",         emoji: "🎭", cats: ["cultura"] },
  { id: "esportes",       label: "Esportes",       emoji: "⚽", cats: ["esportes"] },
  { id: "filme_serie",    label: "Filme/Série",    emoji: "📺", cats: ["cultura"] },
];

function greeting(nome?: string) {
  const h = new Date().getHours();
  const s = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  return nome ? `${s}, ${nome}! 👋` : s;
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

type Sheet = null | "date" | "cat";
type DIYKey = "comida" | "bebida" | "atividade";

// ── componente ────────────────────────────────────────────────────────────────

export default function WizardHome() {
  const router = useRouter();

  const [user, setUser] = useState<RoleUser | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [quando, setQuando] = useState("");
  const [cats, setCats] = useState<string[]>([]);

  const [diyOpen, setDiyOpen] = useState(false);
  const [diyComida, setDiyComida] = useState<string[]>([]);
  const [diyBebida, setDiyBebida] = useState<string[]>([]);
  const [diyAtividade, setDiyAtividade] = useState<string[]>([]);

  const [lat, setLat] = useState(-20.4697);
  const [lng, setLng] = useState(-54.6201);
  const [locLabel, setLocLabel] = useState("Campo Grande, MS");
  const [locLoading, setLocLoading] = useState(false);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [syncSheet, setSyncSheet] = useState(false);
  const [cloudOk, setCloudOk] = useState<boolean | null>(null);
  const [syncCode, setSyncCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");
  const [importOk, setImportOk] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) migrateToNamed(u.nome); // migra dados do key genérico para o key por nome
    setUser(u);
    setAgendamentos(getAgendamentos());
    setHydrated(true);
    navigator.geolocation?.getCurrentPosition(
      (p) => { setLat(p.coords.latitude); setLng(p.coords.longitude); setLocLabel("Localização atual"); },
      () => {},
      { timeout: 5000 }
    );
    // Verifica se cloud sync está configurado
    checkCloudConfigured().then(setCloudOk);
  }, []);

  // Recarrega agenda quando o sheet fecha (usuário pode ter acabado de agendar)
  useEffect(() => {
    if (!sheet) setAgendamentos(getAgendamentos());
  }, [sheet]);

  async function handleSaveName() {
    const nome = nameInput.trim();
    if (!nome) return;
    const u: RoleUser = { nome, criadoEm: new Date().toISOString() };
    saveUser(u);
    migrateToNamed(nome); // garante que dados antigos são migrados
    setUser(u);
    // Tenta carregar dados da nuvem e fazer merge
    const cloud = await loadFromCloud(nome);
    if (cloud) {
      mergeCloudData(cloud);
    }
    syncToCloud(nome); // sobe dados locais para a nuvem (silencioso se não configurado)
    setAgendamentos(getAgendamentos());
  }

  function openSyncSheet() {
    setSyncCode(exportSyncCode());
    setImportCode("");
    setImportError("");
    setImportOk(false);
    setCopied(false);
    setSyncSheet(true);
  }

  async function copySyncCode() {
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — mostra o código para copiar manualmente
    }
  }

  function handleImport() {
    try {
      importSyncCode(importCode.trim());
      setAgendamentos(getAgendamentos());
      setImportOk(true);
      setImportError("");
      if (user) syncToCloud(user.nome);
    } catch {
      setImportError("Código inválido. Certifique-se de copiar o código completo.");
    }
  }

  function requestLoc() {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLat(p.coords.latitude); setLng(p.coords.longitude); setLocLabel("Localização atual"); setLocLoading(false); },
      () => setLocLoading(false),
      { timeout: 8000 }
    );
  }

  function toggleCat(id: string) {
    setCats((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);
  }

  function toggleDiy(key: DIYKey, id: string) {
    const getArr = () => key === "comida" ? diyComida : key === "bebida" ? diyBebida : diyAtividade;
    const setArr = key === "comida" ? setDiyComida : key === "bebida" ? setDiyBebida : setDiyAtividade;
    const arr = getArr();
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function goWizard() {
    const selected = cats.length ? cats : CAT_OPTIONS.map((c) => c.id);
    setSheet(null);
    router.push(`/descobrir?quando=${quando}&categorias=${selected.join(",")}&lat=${lat}&lng=${lng}`);
  }

  function goCategory(catId: string) {
    router.push(`/descobrir?quando=hoje&categorias=${catId}&lat=${lat}&lng=${lng}`);
  }

  function goDiy() {
    const allCats = [
      ...diyComida.flatMap((id) => DIY_COMIDA.find((d) => d.id === id)?.cats ?? []),
      ...diyBebida.flatMap((id) => DIY_BEBIDA.find((d) => d.id === id)?.cats ?? []),
      ...diyAtividade.flatMap((id) => DIY_ATIVIDADE.find((d) => d.id === id)?.cats ?? []),
    ];
    const unique = [...new Set(allCats)];
    const catStr = unique.length ? unique.join(",") : CAT_OPTIONS.map((c) => c.id).join(",");
    router.push(`/descobrir?quando=hoje&categorias=${catStr}&lat=${lat}&lng=${lng}`);
  }

  if (!hydrated) return null;

  // ── Onboarding ────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 flex flex-col max-w-lg mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
          <div className="w-20 h-20 bg-amber-400 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-400/30">
            <span className="text-4xl font-black text-gray-900 leading-none" style={{ fontFamily: "serif" }}>r</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">rolê</h1>
          <p className="text-white/60 mt-2 text-sm leading-relaxed">
            Seu guia de rolê em<br />Campo Grande, MS
          </p>

          <div className="w-full mt-10 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <p className="text-white font-bold mb-1 text-left">Qual é o seu nome?</p>
            <p className="text-white/50 text-xs mb-4 text-left">Seus rolês serão salvos com seu nome</p>
            <input
              type="text"
              placeholder="Ex: João, Maria, Caio..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
              className="w-full bg-white rounded-xl px-4 py-3.5 text-gray-900 font-medium text-base outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              disabled={!nameInput.trim()}
              className={`w-full mt-3 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                nameInput.trim()
                  ? "bg-amber-400 text-gray-900"
                  : "bg-white/20 text-white/40 cursor-not-allowed"
              }`}
            >
              Entrar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Home ──────────────────────────────────────────────────────────────────

  const upcomingAg = agendamentos
    .filter((a) => {
      const d = new Date(a.fullDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    .slice(0, 4);

  const diyHasAny = diyComida.length > 0 || diyBebida.length > 0 || diyAtividade.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto flex flex-col">

      {/* === Header gradient === */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 px-5 pt-14 pb-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex items-center justify-between mb-5">
          <span className="text-2xl font-black text-white tracking-tight">rolê</span>
          <div className="flex items-center gap-2">
            <button
              onClick={openSyncSheet}
              title="Sincronizar dados"
              className="w-8 h-8 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-full"
            >
              {cloudOk
                ? <Cloud size={14} className="text-white/80" />
                : <CloudOff size={14} className="text-white/50" />}
            </button>
            <button
              onClick={requestLoc}
              className="flex items-center gap-1.5 text-white/80 text-xs bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
              {locLoading
                ? <Loader2 size={12} className="animate-spin" />
                : <MapPin size={12} />}
              {locLabel}
            </button>
          </div>
        </div>

        <p className="text-white/60 text-xs relative capitalize">{todayLabel()}</p>
        <h1 className="text-xl font-bold text-white mt-0.5 relative">{greeting(user.nome)}</h1>
      </div>

      {/* === "Que tal mais um?" hero card === */}
      <div className="px-5 -mt-4 relative z-10">
        <button
          onClick={() => setSheet("date")}
          className="w-full bg-gradient-to-r from-amber-400 via-amber-400 to-orange-400 rounded-2xl p-5 text-left shadow-xl shadow-amber-200/60 relative overflow-hidden active:scale-[0.98] transition-transform"
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-4 right-8 w-16 h-16 bg-orange-500/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-amber-900/60" />
              <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest">Descubra</span>
            </div>
            <h2 className="text-2xl font-black text-amber-900 leading-none">Que tal mais um?</h2>
            <p className="text-amber-800/70 text-sm mt-1.5">Toca aqui pra escolher quando sair</p>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {[{ t: "Hoje 🔥" }, { t: "Amanhã" }, { t: "FDS" }, { t: "Semana" }].map(({ t }) => (
                <span key={t} className="bg-amber-900/10 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {t}
                </span>
              ))}
              <div className="ml-auto w-8 h-8 bg-amber-900/15 rounded-full flex items-center justify-center">
                <ChevronRight size={16} className="text-amber-900" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* === Agenda preview === */}
      {upcomingAg.length > 0 && (
        <div className="mt-5 px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck size={15} className="text-violet-600" />
              <h2 className="text-sm font-bold text-gray-900">Seus rolês</h2>
            </div>
            <Link href="/agenda" className="text-xs text-violet-600 font-semibold flex items-center gap-0.5">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {upcomingAg.map((ag) => (
              <div
                key={ag.id}
                className="flex-shrink-0 bg-white border border-gray-100 rounded-xl p-3 w-36 shadow-sm"
              >
                <span className="text-xl">{ag.placeEmoji}</span>
                <p className="text-xs font-bold text-gray-900 mt-2 line-clamp-1">{ag.placeName}</p>
                <p className="text-[11px] text-violet-600 font-semibold mt-0.5">{ag.dateLabel}</p>
                <p className="text-[11px] text-gray-400">{ag.time}</p>
              </div>
            ))}
            <Link
              href="/agenda"
              className="flex-shrink-0 bg-violet-50 border border-violet-100 rounded-xl w-36 flex flex-col items-center justify-center gap-1.5 text-violet-600 py-3"
            >
              <CalendarCheck size={20} />
              <p className="text-[11px] font-semibold">Ver agenda</p>
            </Link>
          </div>
        </div>
      )}

      {/* === Faça você mesmo === */}
      <div className="mt-5 px-5">
        <button
          onClick={() => setDiyOpen(!diyOpen)}
          className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <Wand2 size={18} className="text-violet-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Faça você mesmo</p>
              <p className="text-xs text-gray-400 mt-0.5">Monte seu rolê perfeito</p>
            </div>
          </div>
          <div className={`w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200 ${diyOpen ? "rotate-90" : ""}`}>
            <ChevronRight size={14} className="text-gray-500" />
          </div>
        </button>

        {diyOpen && (
          <div className="bg-white rounded-2xl p-4 mt-2 border border-gray-100 shadow-sm space-y-5">

            {/* Comida */}
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">🍽 O que comer?</p>
              <div className="flex flex-wrap gap-2">
                {DIY_COMIDA.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleDiy("comida", item.id)}
                    className={`text-[13px] px-3 py-1.5 rounded-full border transition-all font-semibold ${
                      diyComida.includes(item.id)
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bebida */}
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">🥂 O que beber?</p>
              <div className="flex flex-wrap gap-2">
                {DIY_BEBIDA.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleDiy("bebida", item.id)}
                    className={`text-[13px] px-3 py-1.5 rounded-full border transition-all font-semibold ${
                      diyBebida.includes(item.id)
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Atividade */}
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">⚡ O que você tá afim?</p>
              <div className="flex flex-wrap gap-2">
                {DIY_ATIVIDADE.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleDiy("atividade", item.id)}
                    className={`text-[13px] px-3 py-1.5 rounded-full border transition-all font-semibold ${
                      diyAtividade.includes(item.id)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>

            {diyHasAny && (
              <button
                onClick={goDiy}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Wand2 size={16} /> Buscar meu rolê perfeito
              </button>
            )}
          </div>
        )}
      </div>

      {/* === Explorar por categoria === */}
      <div className="mt-5 px-5 pb-28">
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Zap size={15} className="text-amber-500" /> Explorar por categoria
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {CAT_OPTIONS.map(({ id, label, Icon, bg, color }) => (
            <button
              key={id}
              onClick={() => goCategory(id)}
              className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
            >
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center`}>
                <Icon size={22} className={color} />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />

      {/* === Bottom sheet — seleção de data === */}
      {sheet === "date" && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setSheet(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 pb-8 pt-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Quando você quer sair?</h2>
                <button onClick={() => setSheet(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DATE_OPTIONS.map(({ id, label, sub, Icon }) => {
                  const active = quando === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setQuando(id); setSheet("cat"); }}
                      className={`rounded-xl p-4 text-left border transition-all ${
                        active ? "border-violet-600 bg-violet-50" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${active ? "bg-violet-600" : "bg-gray-100"}`}>
                        <Icon size={18} className={active ? "text-white" : "text-gray-500"} />
                      </div>
                      <p className={`font-semibold text-sm ${active ? "text-violet-700" : "text-gray-800"}`}>{label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* === Bottom sheet — sync === */}
      {syncSheet && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setSyncSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 pb-10 pt-2 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Sincronizar dados</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cloudOk
                      ? "Sync automático ativado via nuvem"
                      : "Copie o código para transferir entre dispositivos"}
                  </p>
                </div>
                <button onClick={() => setSyncSheet(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>

              {/* Cloud status badge */}
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-5 ${cloudOk ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {cloudOk
                  ? <Cloud size={14} className="flex-shrink-0" />
                  : <CloudOff size={14} className="flex-shrink-0" />}
                <p className="text-xs font-semibold">
                  {cloudOk
                    ? "Nuvem configurada — seus dados sincronizam automaticamente"
                    : "Sem nuvem configurada — use o código manual abaixo"}
                </p>
              </div>

              {/* Export */}
              <div className="mb-5">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Exportar para outro dispositivo</p>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-[10px] font-mono text-gray-500 break-all line-clamp-3 leading-relaxed">{syncCode}</p>
                </div>
                <button
                  onClick={copySyncCode}
                  className={`w-full mt-2 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-900 text-white"
                  }`}
                >
                  {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar código</>}
                </button>
              </div>

              {/* Import */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Importar de outro dispositivo</p>
                <textarea
                  rows={3}
                  value={importCode}
                  onChange={(e) => { setImportCode(e.target.value); setImportError(""); setImportOk(false); }}
                  placeholder="Cole aqui o código do outro dispositivo..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-violet-400 resize-none"
                />
                {importError && <p className="text-xs text-red-500 mt-1">{importError}</p>}
                {importOk && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <Check size={12} /> Dados importados com sucesso!
                  </p>
                )}
                <button
                  onClick={handleImport}
                  disabled={!importCode.trim()}
                  className={`w-full mt-2 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                    importCode.trim() ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <ClipboardPaste size={14} /> Importar dados
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* === Bottom sheet — seleção de categoria === */}
      {sheet === "cat" && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setSheet(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 pb-8 pt-2 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSheet("date")}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <ChevronLeft size={15} className="text-gray-500" />
                  </button>
                  <h2 className="font-bold text-gray-900">O que você quer fazer?</h2>
                </div>
                <button onClick={() => setSheet(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>
              {cats.length > 0 && (
                <p className="text-xs text-violet-600 font-semibold mb-3 ml-10">
                  {cats.length} selecionado{cats.length > 1 ? "s" : ""} — ou deixe em branco para ver tudo
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {CAT_OPTIONS.map(({ id, label, Icon }) => {
                  const active = cats.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleCat(id)}
                      className={`rounded-xl p-4 text-left border transition-all ${
                        active ? "border-violet-600 bg-violet-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${active ? "bg-violet-600" : "bg-gray-100"}`}>
                        <Icon size={18} className={active ? "text-white" : "text-gray-500"} />
                      </div>
                      <p className={`font-semibold text-sm ${active ? "text-violet-700" : "text-gray-800"}`}>{label}</p>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={goWizard}
                className="w-full mt-4 bg-amber-400 text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                {cats.length ? `Ver opções (${cats.length} categorias)` : "Ver todas as opções"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
