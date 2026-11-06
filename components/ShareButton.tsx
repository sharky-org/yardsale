"use client";

import { useState } from "react";
import { copy, fill } from "@/lib/copy";
import { ShareIcon } from "@/components/Icons";

/**
 * Compartilha o link do item: a folha de compartilhar do celular quando existe
 * (`navigator.share`), senão copia o link. A URL sai do endereço que a pessoa
 * está usando, então funciona igual em localhost, preview e produção.
 */
export default function ShareButton({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = copy.items;

  async function share() {
    const url = new URL(path, window.location.origin).href;
    if (navigator.share) {
      // Cancelar a folha rejeita com AbortError: não é erro.
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.copyPrompt, url);
    }
  }

  return (
    <>
      <button
        type="button"
        className="share"
        onClick={share}
        aria-label={fill(t.shareLabel, { title })}
      >
        <ShareIcon />
      </button>
      <span className="share-tip" role="status">
        {copied ? t.copied : ""}
      </span>
    </>
  );
}
