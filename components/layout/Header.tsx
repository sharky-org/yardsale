import Link from "next/link";
import { copy } from "@/lib/copy";

/** Cabeçalho: caixinha (o mesmo desenho do favicon) e o nome da venda. */
export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <img src="/icon.svg" alt="" width={30} height={30} />
          {copy.brand}
        </Link>
      </div>
    </header>
  );
}
