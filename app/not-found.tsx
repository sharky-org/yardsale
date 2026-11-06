import Link from "next/link";
import { copy } from "@/lib/copy";

export default function NotFound() {
  return (
    <div className="container center">
      <p className="eyebrow">404</p>
      <h1>{copy.notFound.title}</h1>
      <p className="lead">{copy.notFound.lead}</p>
      <Link className="btn" href="/">
        {copy.notFound.cta}
      </Link>
    </div>
  );
}
