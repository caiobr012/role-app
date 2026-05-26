"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, Heart, MapPin } from "lucide-react";

const items = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/buscar", icon: Search, label: "Buscar" },
  { href: "/programacao", icon: Calendar, label: "Agenda" },
  { href: "/mapa", icon: MapPin, label: "Mapa" },
  { href: "/favoritos", icon: Heart, label: "Salvos" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg max-w-lg mx-auto">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                active ? "text-violet-600" : "text-gray-400"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? "text-violet-600" : "text-gray-400"}`}>
                {label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-amber-400 -mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
