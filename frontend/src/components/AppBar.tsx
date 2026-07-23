import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useState } from "react";

const WalletMultiButtonDynamic = dynamic(
  () => import("./WalletButton"),
  { ssr: false }
);

const links = [
  { href: "/", label: "Home" },
  { href: "/basics", label: "Stake" },
];

export const AppBar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="brand-mark"
            aria-label="StayKing home"
            onClick={() => setMenuOpen(false)}
          >
            Stay<span>King</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const active = router.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link ${active ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="network-badge hidden sm:inline-flex">
            <span aria-hidden="true" />
            Devnet
          </span>
          <WalletMultiButtonDynamic className="stayking-wallet-button" />
          <button
            type="button"
            className="icon-button md:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <XIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-navigation" className="mobile-nav md:hidden">
          {links.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`mobile-nav-link ${
                  active ? "mobile-nav-link-active" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="network-badge inline-flex sm:hidden">
            <span aria-hidden="true" />
            Solana Devnet
          </span>
        </div>
      )}
    </header>
  );
};
