"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { categorias, type Category } from "@/lib/data";

export default function CategoryFilter({ active }: { active: Category }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(id: Category) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "todos") {
      params.delete("categoria");
    } else {
      params.set("categoria", id);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-1">
      {categorias.map(({ id, label, emoji }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => handleSelect(id as Category)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
