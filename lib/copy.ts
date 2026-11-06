/**
 * Copy do site — só em inglês: a venda é nos EUA e os itens são cadastrados em
 * inglês na Sharky. Todo texto de interface mora em `copy.json`.
 */
import copyJson from "./copy.json";

export const copy = copyJson;

/** Locale do navegador (`<html lang>`, formatação) e do conteúdo na Sharky. */
export const LOCALE = "en-US";

/** Substitui `{chave}` por valores — copy com variáveis sem concatenar. */
export function fill(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
