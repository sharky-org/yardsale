import { copy } from "@/lib/copy";

/** Cabeçalho: caixinha (o mesmo desenho do favicon) e o nome da venda. */
export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#" className="brand">
          <img src="/icon.svg" alt="" width={30} height={30} />
          {copy.brand}
        </a>
      </div>
    </header>
  );
}
