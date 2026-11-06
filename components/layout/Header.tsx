import { copy } from "@/lib/copy";

/** Cabeçalho: só o nome da venda (os contatos são flutuantes). */
export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#" className="brand">
          {copy.brand}
        </a>
      </div>
    </header>
  );
}
