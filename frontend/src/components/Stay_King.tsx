import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import {
  BeakerIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  InformationCircleIcon,
  LightningBoltIcon,
  LockClosedIcon,
  LockOpenIcon,
  RefreshIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { notify } from "../utils/notifications";
import idl from "./stay_king.json";

const WalletMultiButtonDynamic = dynamic(
  () => import("./WalletButton"),
  { ssr: false }
);

const idlObject = JSON.parse(JSON.stringify(idl));
const programId = new PublicKey(idl.metadata.address);
const kingMint = new PublicKey(
  "7zPUjQGEAiZPCiECSmZVgaiTaQHfToWw9kxr2TB7JEoM"
);

type TransactionPhase =
  | "idle"
  | "preparing"
  | "awaiting"
  | "confirming"
  | "success"
  | "error";

type TransactionState = {
  action: string;
  phase: TransactionPhase;
  message: string;
  signature?: string;
};

const initialTransaction: TransactionState = {
  action: "",
  phase: "idle",
  message: "",
};

const shortAddress = (address?: PublicKey | null) =>
  address
    ? `${address.toBase58().slice(0, 5)}…${address.toBase58().slice(-5)}`
    : "—";

const friendlyError = (error: any) => {
  const message =
    error?.error?.errorMessage || error?.message || "Transaction failed.";

  if (/reject|declin|cancel/i.test(message)) {
    return "The transaction was rejected in your wallet.";
  }
  if (/insufficient|0x1/i.test(message)) {
    return "Your wallet does not have enough SOL or KING for this action.";
  }
  if (/already staked|IsStaked/i.test(message)) {
    return "This wallet already has an active KING position.";
  }
  if (/not staked|NotStaked/i.test(message)) {
    return "No active KING position was found for this wallet.";
  }
  return message;
};

export const Stay_King = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const publicKey = wallet.publicKey;

  const [kingBalance, setKingBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [isStaked, setIsStaked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] =
    useState<TransactionState>(initialTransaction);

  const anchorWallet = useMemo(() => {
    if (!publicKey) return null;
    return {
      publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };
  }, [
    publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ]);

  const provider = useMemo(
    () =>
      anchorWallet
        ? new AnchorProvider(
            connection,
            anchorWallet as any,
            AnchorProvider.defaultOptions()
          )
        : null,
    [anchorWallet, connection]
  );

  const program = useMemo(
    () => (provider ? new Program(idlObject, programId, provider) : null),
    [provider]
  );

  const accounts = useMemo(() => {
    if (!publicKey) return null;

    const [kingVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("king-vault")],
      programId
    );
    const [kingVaultAuthority] = PublicKey.findProgramAddressSync(
      [kingVault.toBuffer()],
      programId
    );
    const userAta = getAssociatedTokenAddressSync(kingMint, publicKey);
    const [stakeInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake-info"), publicKey.toBuffer()],
      programId
    );
    const [stakeKing] = PublicKey.findProgramAddressSync(
      [stakeInfo.toBuffer()],
      programId
    );

    return {
      kingVault,
      kingVaultAuthority,
      userAta,
      stakeInfo,
      stakeKing,
    };
  }, [publicKey]);

  const refreshState = useCallback(async () => {
    if (!publicKey || !program || !accounts) {
      setKingBalance(0);
      setSolBalance(0);
      setIsStaked(false);
      return;
    }

    setLoading(true);
    try {
      const [lamports, tokenBalance, stakeInfo] = await Promise.all([
        connection.getBalance(publicKey, "confirmed"),
        connection
          .getTokenAccountBalance(accounts.userAta, "confirmed")
          .then((result) => result.value.uiAmount || 0)
          .catch(() => 0),
        (program.account as any).stakeInfo
          .fetchNullable(accounts.stakeInfo)
          .catch(() => null),
      ]);

      setSolBalance(lamports / LAMPORTS_PER_SOL);
      setKingBalance(tokenBalance);
      setIsStaked(Boolean(stakeInfo?.isStaked));
    } catch (error) {
      notify({
        type: "error",
        message: "Could not refresh account state",
        description: friendlyError(error),
      });
    } finally {
      setLoading(false);
    }
  }, [accounts, connection, program, publicKey]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const confirmSignature = async (signature: string) => {
    setTransaction((current) => ({
      ...current,
      phase: "confirming",
      message: "Transaction submitted. Confirming on Devnet…",
      signature,
    }));
    await connection.confirmTransaction(signature, "confirmed");
  };

  const runProgramAction = async (
    action: string,
    pendingMessage: string,
    successMessage: string,
    operation: () => Promise<TransactionSignature>
  ) => {
    setTransaction({
      action,
      phase: "preparing",
      message: "Preparing the transaction…",
    });

    try {
      setTransaction({
        action,
        phase: "awaiting",
        message: pendingMessage,
      });
      const signature = await operation();
      await confirmSignature(signature);
      await refreshState();

      setTransaction({
        action,
        phase: "success",
        message: successMessage,
        signature,
      });
      notify({
        type: "success",
        message: successMessage,
        txid: signature,
      });
    } catch (error) {
      const description = friendlyError(error);
      setTransaction({
        action,
        phase: "error",
        message: description,
      });
      notify({
        type: "error",
        message: `${action} failed`,
        description,
      });
    }
  };

  const requestSol = async () => {
    if (!publicKey) return;

    setTransaction({
      action: "Fund wallet",
      phase: "preparing",
      message: "Requesting 1 Devnet SOL…",
    });
    try {
      const signature = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL
      );
      await confirmSignature(signature);
      await refreshState();
      setTransaction({
        action: "Fund wallet",
        phase: "success",
        message: "Wallet funded with 1 Devnet SOL.",
        signature,
      });
      notify({
        type: "success",
        message: "Wallet funded with 1 Devnet SOL",
        txid: signature,
      });
    } catch (error) {
      const description = friendlyError(error);
      setTransaction({
        action: "Fund wallet",
        phase: "error",
        message: description,
      });
      notify({
        type: "error",
        message: "Devnet airdrop failed",
        description,
      });
    }
  };

  const claimKing = () => {
    if (!program || !accounts || !publicKey) return;
    return runProgramAction(
      "Claim KING",
      "Approve the KING claim in your wallet…",
      "1 demo KING claimed successfully.",
      async () => {
        const initializeAta = await program.methods
          .initializeAssociatedTokenAccount()
          .accounts({
            user: publicKey,
            userAta: accounts.userAta,
            tokenMint: kingMint,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .prepare();

        return program.methods
          .airdrop()
          .preInstructions([initializeAta.instruction])
          .accounts({
            receiver: accounts.userAta,
            kingVaultAccount: accounts.kingVault,
            kingVaultAuthority: accounts.kingVaultAuthority,
            tokenMint: kingMint,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      }
    );
  };

  const stakeKing = () => {
    if (!program || !accounts || !publicKey) return;
    return runProgramAction(
      "Stake KING",
      "Approve staking 1 KING in your wallet…",
      "1 KING is now actively staked.",
      () =>
        program.methods
          .stake()
          .accounts({
            user: publicKey,
            userAta: accounts.userAta,
            stakeInfoAccount: accounts.stakeInfo,
            stakeKingAccount: accounts.stakeKing,
            mint: kingMint,
          })
          .rpc()
    );
  };

  const unstakeKing = () => {
    if (!program || !accounts || !publicKey) return;
    return runProgramAction(
      "Unstake KING",
      "Approve unstaking in your wallet…",
      "Stake closed. You received 2 KING total.",
      async () => {
        const closeAccounts = await program.methods
          .closeStakingAccounts()
          .accounts({
            user: publicKey,
            stakeInfoAccount: accounts.stakeInfo,
            stakeKingAccount: accounts.stakeKing,
          })
          .prepare();

        return program.methods
          .unstake()
          .postInstructions([closeAccounts.instruction])
          .accounts({
            user: publicKey,
            userAta: accounts.userAta,
            stakeInfoAccount: accounts.stakeInfo,
            stakeKingAccount: accounts.stakeKing,
            kingVaultAccount: accounts.kingVault,
            kingVaultAuthority: accounts.kingVaultAuthority,
            mint: kingMint,
          })
          .rpc();
      }
    );
  };

  const transactionPending = [
    "preparing",
    "awaiting",
    "confirming",
  ].includes(transaction.phase);
  const hasFeeBalance = solBalance >= 0.01;

  const primaryAction = !hasFeeBalance
    ? {
        label: "Get 1 Devnet SOL",
        help: "A small SOL balance is required for transaction fees and rent.",
        onClick: requestSol,
        icon: LightningBoltIcon,
      }
    : isStaked
    ? {
        label: "Unstake and receive 2 KING",
        help: "Returns 1 KING principal and awards a fixed 1 KING reward.",
        onClick: unstakeKing,
        icon: LockOpenIcon,
      }
    : kingBalance < 1
    ? {
        label: "Claim 1 demo KING",
        help: "Creates your token account if needed and transfers 1 KING.",
        onClick: claimKing,
        icon: CreditCardIcon,
      }
    : {
        label: "Stake 1 KING",
        help: "Transfers exactly 1 KING into the program-controlled account.",
        onClick: stakeKing,
        icon: LockClosedIcon,
      };

  const PrimaryIcon = primaryAction.icon;

  return (
    <div className="dashboard-layout">
      <section className="dashboard-heading">
        <div>
          <div className="eyebrow">
            <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
            KING staking lab
          </div>
          <h1>Staking dashboard</h1>
          <p>
            Follow your KING position from wallet token account to staking PDA
            and back again.
          </p>
        </div>
        {publicKey && (
          <button
            type="button"
            className="refresh-button"
            onClick={refreshState}
            disabled={loading || transactionPending}
          >
            <RefreshIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </button>
        )}
      </section>

      <section className="metrics-grid" aria-label="Wallet and staking summary">
        <MetricCard
          label="Available balance"
          value={publicKey ? `${kingBalance.toLocaleString()} KING` : "—"}
          note={publicKey ? "In your wallet token account" : "Connect wallet"}
          icon={CreditCardIcon}
        />
        <MetricCard
          label="Active stake"
          value={publicKey ? (isStaked ? "1 KING" : "0 KING") : "—"}
          note={isStaked ? "Held by the staking program" : "No active position"}
          icon={LockClosedIcon}
          active={isStaked}
        />
        <MetricCard
          label="Unstake outcome"
          value={isStaked ? "2 KING" : "—"}
          note="1 principal + 1 fixed reward"
          icon={LockOpenIcon}
          accent="amber"
        />
      </section>

      <section className="faucet-panel" aria-labelledby="faucet-title">
        <div>
          <div className="flex items-center gap-2">
            <BeakerIcon className="h-5 w-5 text-sk-amber" aria-hidden="true" />
            <h2 id="faucet-title">Devnet faucet</h2>
          </div>
          <p>
            Testing utilities stay available throughout the staking cycle.
            Devnet SOL pays transaction fees; demo KING is the token you stake.
          </p>
        </div>

        <div className="faucet-actions">
          <button
            type="button"
            className="faucet-button faucet-button-sol"
            onClick={requestSol}
            disabled={!publicKey || loading || transactionPending}
            aria-busy={
              transactionPending && transaction.action === "Fund wallet"
            }
          >
            <LightningBoltIcon className="h-5 w-5" aria-hidden="true" />
            Request 1 SOL
          </button>
          <button
            type="button"
            className="faucet-button faucet-button-king"
            onClick={claimKing}
            disabled={
              !publicKey || !hasFeeBalance || loading || transactionPending
            }
            aria-busy={
              transactionPending && transaction.action === "Claim KING"
            }
            title={
              publicKey && !hasFeeBalance
                ? "Request Devnet SOL before claiming KING"
                : undefined
            }
          >
            <CreditCardIcon className="h-5 w-5" aria-hidden="true" />
            Claim 1 KING
          </button>
          {!publicKey && (
            <p className="faucet-requirement">Connect a wallet to use faucets.</p>
          )}
          {publicKey && !hasFeeBalance && (
            <p className="faucet-requirement">
              Request SOL first to cover the KING claim transaction.
            </p>
          )}
        </div>
      </section>

      <div className="dashboard-columns">
        <section className="position-card" aria-labelledby="position-title">
          <div className="position-card-header">
            <div>
              <p className="metric-label">Your position</p>
              <h2 id="position-title">
                {!publicKey
                  ? "Connect to begin"
                  : loading
                  ? "Loading account state"
                  : isStaked
                  ? "1 KING actively staked"
                  : "Ready for the next step"}
              </h2>
            </div>
            <PositionBadge
              connected={Boolean(publicKey)}
              loading={loading}
              active={isStaked}
            />
          </div>

          {!publicKey ? (
            <div className="empty-position">
              <div className="empty-position-icon">
                <CreditCardIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3>Connect a wallet to load your KING accounts.</h3>
              <p>
                StayKing will check your Devnet SOL, KING balance, and staking
                PDA before presenting the next valid action.
              </p>
              <WalletMultiButtonDynamic className="stayking-wallet-button dashboard-wallet-button" />
            </div>
          ) : (
            <>
              <div className="position-breakdown">
                <div>
                  <span>Wallet</span>
                  <strong>{shortAddress(publicKey)}</strong>
                </div>
                <div>
                  <span>Program position</span>
                  <strong>{isStaked ? "Active" : "Not created"}</strong>
                </div>
                <div>
                  <span>Reward model</span>
                  <strong>Fixed 1 KING</strong>
                </div>
              </div>

              <div className="action-panel">
                <button
                  type="button"
                  className="primary-button w-full justify-center"
                  onClick={primaryAction.onClick}
                  disabled={loading || transactionPending}
                  aria-busy={transactionPending}
                >
                  {transactionPending ? (
                    <RefreshIcon
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <PrimaryIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                  {transactionPending
                    ? transaction.message
                    : primaryAction.label}
                </button>
                <p>{primaryAction.help}</p>
              </div>
            </>
          )}

          {transaction.phase !== "idle" && (
            <TransactionStatus transaction={transaction} />
          )}
        </section>

        <aside className="mechanics-card" aria-labelledby="mechanics-title">
          <p className="metric-label">Learning mode</p>
          <h2 id="mechanics-title">What happens on-chain</h2>

          <ol className="mechanics-list">
            <MechanicStep
              number="1"
              title="Token account"
              description="KING is held in your associated token account."
              complete={Boolean(publicKey)}
            />
            <MechanicStep
              number="2"
              title="Stake instruction"
              description="Exactly 1 KING moves to a program-controlled account."
              complete={isStaked}
            />
            <MechanicStep
              number="3"
              title="StakeInfo PDA"
              description="The PDA records your wallet and active amount."
              complete={isStaked}
            />
            <MechanicStep
              number="4"
              title="Unstake reward"
              description="Principal returns with a fixed 1 KING reward."
              complete={transaction.action === "Unstake KING" && transaction.phase === "success"}
              last
            />
          </ol>
        </aside>
      </div>

      <details className="technical-details">
        <summary>View on-chain details</summary>
        <div className="technical-grid">
          <TechnicalRow
            label="Program"
            value={programId.toBase58()}
            explorer={`https://explorer.solana.com/address/${programId.toBase58()}?cluster=devnet`}
          />
          <TechnicalRow
            label="KING mint"
            value={kingMint.toBase58()}
            explorer={`https://explorer.solana.com/address/${kingMint.toBase58()}?cluster=devnet`}
          />
          {accounts && (
            <TechnicalRow
              label="StakeInfo PDA"
              value={accounts.stakeInfo.toBase58()}
              explorer={`https://explorer.solana.com/address/${accounts.stakeInfo.toBase58()}?cluster=devnet`}
            />
          )}
        </div>
      </details>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  note,
  icon: Icon,
  active = false,
  accent = "green",
}: any) => (
  <article className={`metric-card ${active ? "metric-card-active" : ""}`}>
    <div className={`metric-icon metric-icon-${accent}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
    <p className="metric-label">{label}</p>
    <p className="metric-value">{value}</p>
    <p className="metric-note">{note}</p>
  </article>
);

const PositionBadge = ({ connected, loading, active }: any) => {
  const label = !connected
    ? "Disconnected"
    : loading
    ? "Syncing"
    : active
    ? "Active"
    : "Ready";
  const tone = !connected ? "neutral" : loading ? "amber" : active ? "green" : "violet";

  return (
    <span className={`position-badge position-badge-${tone}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
};

const TransactionStatus = ({
  transaction,
}: {
  transaction: TransactionState;
}) => {
  const success = transaction.phase === "success";
  const error = transaction.phase === "error";
  const Icon = success
    ? CheckCircleIcon
    : error
    ? XCircleIcon
    : InformationCircleIcon;

  return (
    <div
      className={`transaction-status ${
        success ? "transaction-success" : error ? "transaction-error" : ""
      }`}
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <strong>{transaction.action}</strong>
        <p>{transaction.message}</p>
      </div>
      {transaction.signature && (
        <a
          href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          aria-label="View transaction in Solana Explorer"
        >
          Explorer
          <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
};

const MechanicStep = ({
  number,
  title,
  description,
  complete,
  last = false,
}: any) => (
  <li>
    <div className="mechanic-marker-wrap">
      <span
        className={`mechanic-marker ${complete ? "mechanic-marker-complete" : ""}`}
      >
        {complete ? (
          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          number
        )}
      </span>
      {!last && <span className="mechanic-line" aria-hidden="true" />}
    </div>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </li>
);

const TechnicalRow = ({ label, value, explorer }: any) => (
  <div className="technical-row">
    <span>{label}</span>
    <code title={value}>{shortAddress(new PublicKey(value))}</code>
    <a
      href={explorer}
      target="_blank"
      rel="noreferrer"
      aria-label={`View ${label} in Solana Explorer`}
    >
      <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
    </a>
  </div>
);
