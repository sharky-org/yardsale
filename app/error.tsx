"use client";

import { copy } from "@/lib/copy";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container center">
      <p className="eyebrow">Error</p>
      <h1>{copy.error.title}</h1>
      <p className="lead">{copy.error.lead}</p>
      <button className="btn" onClick={reset}>
        {copy.error.retry}
      </button>
    </div>
  );
}
