import Link from "next/link";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BeakerIcon,
  ExternalLinkIcon,
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
} from "@heroicons/react/outline";

const lifecycle = [
  {
    number: "01",
    title: "Fund & claim KING",
    description:
      "Use Devnet SOL for transaction fees, then claim 1 demo KING into your wallet token account.",
    note: "Devnet only",
    icon: BeakerIcon,
    tone: "amber",
  },
  {
    number: "02",
    title: "Stake 1 KING",
    description:
      "Your KING moves into a program-controlled token account while a StakeInfo PDA records the position.",
    note: "PDA state recorded",
    icon: LockClosedIcon,
    tone: "green",
  },
  {
    number: "03",
    title: "Unstake & receive",
    description:
      "Get the 1 KING principal back plus a fixed 1 KING reward, then close the temporary staking accounts.",
    note: "2 KING total",
    icon: LockOpenIcon,
    tone: "violet",
  },
];

export const HomeView = () => (
  <main className="flex-1 overflow-hidden">
    <section className="hero-section">
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-two" aria-hidden="true" />

      <div className="page-shell hero-grid">
        <div className="relative z-10">
          <div className="eyebrow">
            <AcademicCapIcon className="h-4 w-4" aria-hidden="true" />
            Educational staking lab
          </div>

          <h1 className="hero-title">
            Learn token
            <span className="gradient-text block">staking on Solana</span>
          </h1>

          <p className="hero-copy">
            Follow a simplified KING-token staking cycle on Devnet. Claim a
            token, inspect the on-chain position, and unstake to receive a fixed
            reward.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/basics" className="primary-button">
              Open staking dashboard
              <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
            <a
              href="https://github.com/Memewtoo/stayking"
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >
              View documentation
              <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="hero-disclaimer">
            <ShieldCheckIcon
              className="h-5 w-5 text-sk-amber"
              aria-hidden="true"
            />
            <span>Devnet learning project—tokens have no monetary value.</span>
          </div>
        </div>

        <div className="hero-preview" aria-label="Example KING staking position">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="metric-label">KING wallet balance</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">1.00 KING</p>
            </div>
            <div className="icon-tile">
              <LockClosedIcon className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="preview-row">
              <span>Stake amount</span>
              <strong className="text-sk-green">1 KING</strong>
            </div>
            <div className="preview-row">
              <span>Unstake outcome</span>
              <strong className="text-sk-amber">2 KING total</strong>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-sk-border/70 bg-sk-bg/50 p-4">
            <p className="metric-label">Reward model</p>
            <p className="mt-2 text-sm text-sk-secondary">
              1 KING principal + 1 KING fixed reward
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3 border-t border-sk-border/70 pt-6">
            <span className="status-dot status-dot-active" aria-hidden="true" />
            <p className="text-sm text-sk-secondary">
              <strong className="text-sk-green">On-chain program</strong>
              <span className="mx-2 text-sk-border">·</span>
              Solana Devnet
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="lifecycle-section" id="staking-lifecycle">
      <div className="page-shell">
        <div className="section-heading">
          <p className="section-kicker">The staking lifecycle</p>
          <h2>A clear view of every on-chain step.</h2>
          <p>
            StayKing deliberately keeps the economics simple so you can focus
            on accounts, instructions, and transaction state.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {lifecycle.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="lifecycle-card">
                <div className={`step-icon step-icon-${step.tone}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mt-7 text-xs font-bold tracking-[0.16em] text-sk-muted">
                  STEP {step.number}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-sk-secondary">
                  {step.description}
                </p>
                <p className={`step-note step-note-${step.tone}`}>
                  {step.note}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section className="page-shell py-20">
      <div className="launch-card">
        <div>
          <p className="section-kicker text-left">Ready when you are</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Put the KING staking cycle into practice.
          </h2>
          <p className="mt-3 max-w-2xl text-sk-secondary">
            Connect a wallet, claim demo KING, and inspect each Devnet
            transaction. No registration required.
          </p>
        </div>
        <Link href="/basics" className="primary-button shrink-0">
          Launch dashboard
          <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  </main>
);
