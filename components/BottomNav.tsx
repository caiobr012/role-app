"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Heart, MapPin } from "lucide-react";

const ITEMS = [
  { href: "/",           Icon: Home,        label: "Início"     },
  { href: "/buscar",     Icon: Search,      label: "Buscar"     },
  { href: "/programacao",Icon: CalendarDays,label: "Agenda"     },
  { href: "/mapa",       Icon: MapPin,      label: "Mapa"       },
  { href: "/favoritos",  Icon: Heart,       label: "Salvos"     },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 max-w-lg mx-auto">
      <div className="flex items-stretch justify-around h-16">
        {ITEMS.map(({ href, Icon, label }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${
                active ? "text-violet-600" : "text-gray-400"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.6} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
