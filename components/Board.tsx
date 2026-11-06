"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/sharky";
import { copy } from "@/lib/copy";
import ItemCard from "@/components/ItemCard";

/**
 * Lista única da venda: filtro por categoria e todos os itens (sem paginação).
 * Só o filtro roda no cliente — a página em si continua estática (SSG + ISR).
 */
export default function Board({ items }: { items: ContentItem[] }) {
  const [category, setCategory] = useState("");
  const t = copy.items;

  const categories = [...new Set(items.flatMap((i) => i.categories))];
  const visible = category
    ? items.filter((i) => i.categories.includes(category))
    : items;

  return (
    <section id="items" className="section">
      <h2 className="display">{t.title}</h2>

      {categories.length > 1 && (
        <ul className="cats" aria-label={t.filterLabel}>
          <li>
            <button
              type="button"
              aria-pressed={!category}
              onClick={() => setCategory("")}
            >
              {t.all}
            </button>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <button
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}

      {visible.length === 0 ? (
        <p className="section-lead">{t.empty}</p>
      ) : (
        <div className="grid">
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
