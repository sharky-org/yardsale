/**
 * Ilustrações chapadas no estilo dos stories de referência (azul, limão e
 * pêssego). SVG inline: sem request extra e as cores vêm dos tokens do CSS.
 */

/** Selo redondo: texto curvo em cima e embaixo, faixa limão no meio. */
export function Stamp({ lines, text }: { lines: string[]; text: string }) {
  return (
    <svg className="stamp" viewBox="0 0 160 160" role="img" aria-label={text}>
      <defs>
        <path id="stamp-top" d="M24 80 A56 56 0 0 1 136 80" />
        <path id="stamp-bottom" d="M16 80 A64 64 0 0 0 144 80" />
      </defs>
      <circle cx="80" cy="80" r="74" fill="var(--peach)" />
      <circle
        cx="80"
        cy="80"
        r="68"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <ellipse cx="80" cy="80" rx="80" ry="31" fill="var(--lime)" />
      <text className="stamp-arc" textAnchor="middle">
        <textPath href="#stamp-top" startOffset="50%">
          {text}
        </textPath>
      </text>
      <text className="stamp-arc" textAnchor="middle">
        <textPath href="#stamp-bottom" startOffset="50%">
          {text}
        </textPath>
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          className="stamp-main"
          x="80"
          y={lines.length > 1 ? 76 + i * 18 : 86}
          textAnchor="middle"
        >
          {line}
        </text>
      ))}
    </svg>
  );
}

/** Cômoda com caixa de mudança (e quadros) e um abajur em cima. */
export function HeroArt() {
  return (
    <svg className="hero-art" viewBox="20 26 212 226" aria-hidden="true">
      {/* quadros saindo da caixa */}
      <g transform="rotate(-10 75 80)">
        <rect x="60" y="60" width="30" height="38" rx="2" fill="var(--cream)" />
        <rect x="66" y="66" width="18" height="26" fill="var(--lime)" />
      </g>
      <g transform="rotate(9 108 76)">
        <rect x="92" y="56" width="32" height="40" rx="2" fill="var(--lime)" />
        <rect x="98" y="62" width="20" height="28" fill="var(--cream)" />
        <rect x="101" y="72" width="14" height="3" fill="var(--blue)" />
        <rect x="101" y="78" width="10" height="3" fill="var(--blue)" />
      </g>

      {/* caixa de mudança */}
      <polygon points="46,92 32,78 60,78 66,92" fill="var(--peach)" />
      <polygon points="138,92 152,78 124,78 118,92" fill="var(--peach)" />
      <rect x="46" y="92" width="92" height="36" fill="var(--lime)" />
      <rect x="46" y="99" width="92" height="2.5" fill="var(--blue)" />
      <rect x="78" y="108" width="28" height="10" rx="2" fill="var(--peach)" />

      {/* abajur */}
      <rect x="168" y="120" width="40" height="8" rx="3" fill="var(--lime)" />
      <rect x="185" y="74" width="6" height="48" fill="var(--lime)" />
      <polygon points="156,80 220,80 206,34 170,34" fill="var(--peach)" />
      <rect x="207" y="80" width="2" height="16" fill="var(--lime)" />
      <circle cx="208" cy="98" r="3.5" fill="var(--lime)" />

      {/* cômoda */}
      <rect x="30" y="128" width="190" height="14" rx="4" fill="var(--lime)" />
      <rect x="42" y="142" width="166" height="82" fill="var(--lime)" />
      <rect x="54" y="152" width="142" height="28" rx="4" fill="var(--peach)" />
      <rect x="54" y="188" width="142" height="28" rx="4" fill="var(--peach)" />
      <circle cx="125" cy="166" r="4.5" fill="var(--blue)" />
      <circle cx="125" cy="202" r="4.5" fill="var(--blue)" />
      <polygon points="48,224 64,224 60,250 52,250" fill="var(--lime)" />
      <polygon points="186,224 202,224 198,250 190,250" fill="var(--lime)" />
    </svg>
  );
}

/** Cerquinha de madeira, usada como divisória entre as seções. */
export function Fence() {
  return <div className="fence" aria-hidden="true" />;
}
