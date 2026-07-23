import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { ComponentProps } from "react";

const labels = {
  "change-wallet": "Switch wallet",
  connecting: "Connecting…",
  "copy-address": "Copy address",
  copied: "Address copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect wallet",
  "no-wallet": "Connect wallet",
} as const;

type WalletButtonProps = Omit<
  ComponentProps<typeof BaseWalletMultiButton>,
  "labels"
>;

const WalletButton = ({
  className = "",
  ...props
}: WalletButtonProps) => (
  <div className={`stayking-wallet-control ${className}`}>
    <BaseWalletMultiButton {...props} labels={labels} />
  </div>
);

export default WalletButton;
