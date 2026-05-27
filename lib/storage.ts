// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface RoleUser {
  nome: string;
  criadoEm: string;
}

export interface Agendamento {
  id: string;
  placeName: string;
  placeAddress: string;
  placeCategory: string;
  placeCategoryLabel: string;
  placeEmoji: string;
  placeColor: string;
  dateLabel: string;
  dateSub: string;
  time: string;
  fullDate: string;
  criadoEm: string;
}

export interface Visita {
  id: string;
  placeId: string;
  placeName: string;
  placeAddress: string;
  placeCategory: string;
  placeCategoryLabel: string;
  placeEmoji: string;
  placeColor: string;
  rating: number;
  review: string;
  fotos: string[];
  criadoEm: string;
}

export interface CloudData {
  agendamentos: Agendamento[];
  visitas: Visita[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const USER_KEY = "role_user";

export function normalizeNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 30);
}

function getCurrentNome(): string {
  if (typeof window === "undefined") return "_anon";
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return "_anon";
    const u = JSON.parse(raw) as RoleUser;
    return normalizeNome(u.nome);
  } catch { return "_anon"; }
}

function agKey(nome?: string): string {
  return `role_ag_${nome ?? getCurrentNome()}`;
}

function visKey(nome?: string): string {
  return `role_vis_${nome ?? getCurrentNome()}`;
}

// ── Usuário ───────────────────────────────────────────────────────────────────

export function getUser(): RoleUser | null {
  if (typeof window === "undefined") return null;
  try {
    const r = localStorage.getItem(USER_KEY);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}

export function saveUser(u: RoleUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

// Migra dados dos keys genéricos antigos para os keys por nome, se necessário
export function migrateToNamed(nome: string): void {
  if (typeof window === "undefined") return;
  const norm = normalizeNome(nome);
  const ak = agKey(norm);
  const vk = visKey(norm);
  if (!localStorage.getItem(ak)) {
    const old = localStorage.getItem("role_agendamentos");
    if (old) localStorage.setItem(ak, old);
  }
  if (!localStorage.getItem(vk)) {
    const old = localStorage.getItem("role_visitas");
    if (old) localStorage.setItem(vk, old);
  }
}

// ── Agendamentos ──────────────────────────────────────────────────────────────

export function getAgendamentos(): Agendamento[] {
  if (typeof window === "undefined") return [];
  try {
    const r = localStorage.getItem(agKey());
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}

export function addAgendamento(data: Omit<Agendamento, "id" | "criadoEm">): Agendamento {
  const ag: Agendamento = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toISOString(),
  };
  const list = getAgendamentos();
  list.push(ag);
  localStorage.setItem(agKey(), JSON.stringify(list));
  return ag;
}

export function removeAgendamento(id: string): void {
  if (typeof window === "undefined") return;
  const list = getAgendamentos().filter((a) => a.id !== id);
  localStorage.setItem(agKey(), JSON.stringify(list));
}

// ── Visitas ───────────────────────────────────────────────────────────────────

export function getVisitas(): Visita[] {
  if (typeof window === "undefined") return [];
  try {
    const r = localStorage.getItem(visKey());
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}

export function addVisita(data: Omit<Visita, "id" | "criadoEm">): Visita {
  const v: Visita = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toISOString(),
  };
  const list = getVisitas();
  list.push(v);
  localStorage.setItem(visKey(), JSON.stringify(list));
  return v;
}

export function removeVisita(id: string): void {
  if (typeof window === "undefined") return;
  const list = getVisitas().filter((v) => v.id !== id);
  localStorage.setItem(visKey(), JSON.stringify(list));
}

// ── Código de sync (sem backend) ──────────────────────────────────────────────
// Encoda os dados (sem fotos) em base64 para copiar/colar entre dispositivos

export function exportSyncCode(): string {
  const data: CloudData = {
    agendamentos: getAgendamentos(),
    visitas: getVisitas().map((v) => ({ ...v, fotos: [] })), // fotos excluídas
  };
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function importSyncCode(code: string): void {
  if (typeof window === "undefined") return;
  const data: CloudData = JSON.parse(decodeURIComponent(atob(code)));
  mergeCloudData(data);
}

// ── Sync com cloud (Upstash/Vercel KV — opcional) ─────────────────────────────

export async function loadFromCloud(nome: string): Promise<CloudData | null> {
  try {
    const res = await fetch(`/api/sync?nome=${encodeURIComponent(nome)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.ok || !json.data) return null;
    return json.data as CloudData;
  } catch { return null; }
}

export async function syncToCloud(nome: string): Promise<boolean> {
  try {
    const data: CloudData = {
      agendamentos: getAgendamentos(),
      visitas: getVisitas(),
    };
    const res = await fetch(`/api/sync?nome=${encodeURIComponent(nome)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.ok === true;
  } catch { return false; }
}

export async function checkCloudConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/sync?nome=__ping__", { cache: "no-store" });
    const json = await res.json();
    return json.ok === true && json.reason !== "not-configured";
  } catch { return false; }
}

export function mergeCloudData(cloud: CloudData): void {
  if (typeof window === "undefined") return;

  const localAgs = getAgendamentos();
  const cloudAgs = cloud.agendamentos ?? [];
  const mergedAgs = [...localAgs];
  cloudAgs.forEach((ag) => {
    if (!mergedAgs.find((a) => a.id === ag.id)) mergedAgs.push(ag);
  });
  localStorage.setItem(agKey(), JSON.stringify(mergedAgs));

  const localVis = getVisitas();
  const cloudVis = cloud.visitas ?? [];
  const mergedVis = [...localVis];
  cloudVis.forEach((v) => {
    if (!mergedVis.find((x) => x.id === v.id)) mergedVis.push(v);
  });
  localStorage.setItem(visKey(), JSON.stringify(mergedVis));
}
