"use client";

import { CATEGORY_IDS, categoryName, type CategoryId } from "@/lib/categories";
import { useLocale } from "@/lib/locale-context";
import { UI } from "@/lib/ui-strings";

type Props = {
  selected: CategoryId | "all";
  onChange: (next: CategoryId | "all") => void;
  availableCategories: Set<CategoryId>;
};

export function CategoryFilter({ selected, onChange, availableCategories }: Props) {
  const { locale } = useLocale();
  const ui = UI[locale];

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2">
        <Chip selected={selected === "all"} onClick={() => onChange("all")}>
          {ui.all}
        </Chip>
        {CATEGORY_IDS.filter((id) => availableCategories.has(id)).map((id) => (
          <Chip key={id} selected={selected === id} onClick={() => onChange(id)}>
            {categoryName(id, locale)}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition-colors ${
        selected
          ? "bg-stone-900 text-white"
          : "bg-stone-100 text-stone-700 active:bg-stone-200"
      }`}
    >
      {children}
    </button>
  );
}
