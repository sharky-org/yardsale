"use client";

import { useEffect, useId, useRef, useState } from "react";
import { copy } from "@/lib/copy";

/**
 * Descrição na lista: o CSS corta em poucas linhas e o "Show more" só aparece
 * quando o texto passa do corte. Abre ali mesmo; o texto inteiro também está
 * na página do item.
 */
export default function Description({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [long, setLong] = useState(false);
  const [open, setOpen] = useState(false);
  const t = copy.items;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // O observer dispara ao observar e de novo quando a largura muda (girar o
    // celular). Só mede fechado: aberto, o texto cabe e o botão sumiria.
    const ro = new ResizeObserver(() => {
      if (el.dataset.open === "false") {
        setLong(el.scrollHeight > el.clientHeight + 1);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <div
        ref={ref}
        id={id}
        className="prose clamp"
        data-open={open}
        data-long={long}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {long && (
        <button
          type="button"
          className="more-toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? t.showLess : t.showMore}
        </button>
      )}
    </div>
  );
}
