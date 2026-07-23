import Link from "next/link";
import { ExternalLinkIcon } from "@heroicons/react/outline";

export const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-inner">
      <div>
        <Link href="/" className="brand-mark text-lg" aria-label="StayKing home">
          Stay<span>King</span>
        </Link>
        <p className="mt-3 text-sm text-sk-muted">
          Educational Solana token staking on Devnet.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          className="footer-link"
          href="https://github.com/Memewtoo/stayking"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
          <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          className="footer-link"
          href="https://solana.com/docs"
          target="_blank"
          rel="noreferrer"
        >
          Solana Docs
          <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
    <div className="devnet-disclaimer">
      This is an educational tool running on Solana Devnet. Demo KING has no
      monetary value and cannot be exchanged for real assets.
    </div>
  </footer>
);
