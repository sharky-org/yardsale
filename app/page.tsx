import { fetchAllCatalog, fetchSiteInfo } from "@/lib/sharky";
import { getStatus } from "@/lib/garage";
import { LOCALE, copy } from "@/lib/copy";
import Board from "@/components/Board";
import ItemsJsonLd from "@/components/JsonLd";
import { Fence, HeroArt, Stamp } from "@/components/Illustrations";

export const revalidate = 60; // literal: o Next exige valor estático

const ORDER = { available: 0, reserved: 1, sold: 2 } as const;

export default async function HomePage() {
  // Nome e descrição do projeto na Sharky são a frase e o texto do topo.
  const [all, site] = await Promise.all([
    fetchAllCatalog(LOCALE),
    fetchSiteInfo(),
  ]);
  // Disponíveis primeiro, vendidos por último (sort estável mantém a ordem da Sharky).
  const items = [...all].sort(
    (a, b) => ORDER[getStatus(a)] - ORDER[getStatus(b)],
  );

  return (
    <div className="container">
      <ItemsJsonLd items={items} />

      <section className="hero">
        <Stamp lines={copy.hero.titleLines} text={copy.stamp.text} />
        <p className="eyebrow">{copy.hero.eyebrow}</p>
        <h1 className="display">
          {copy.hero.titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <HeroArt />
        <p className="subtitle">{site.name}</p>
        {copy.hero.when && <p className="when">{copy.hero.when}</p>}
        {site.description && <p className="lead">{site.description}</p>}
        <a className="btn" href="#items">
          {copy.hero.cta}
        </a>
      </section>

      <Fence />

      <ol className="steps">
        {copy.steps.map((s, i) => (
          <li key={s.title}>
            <span className="step-n">{i + 1}</span>
            <div>
              <strong>{s.title}</strong>
              <span> — {s.text}</span>
            </div>
          </li>
        ))}
      </ol>

      <Board items={items} phone={site.phone} />

      <p className="pickup">{copy.pickup}</p>
    </div>
  );
}
