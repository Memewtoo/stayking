import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StayKing } from "../target/types/stay_king";
import {
  Keypair,
  Connection,
  ParsedAccountData,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";

import env_wallet from "../wallet.json";

describe("stay_king", () => {
  // Configure the client to use the env cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.StayKing as Program<StayKing>;
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;

  // Static generated keypair for user; used for testing
  const userKeypair = Keypair.fromSecretKey(
    new Uint8Array([
      22, 175, 8, 226, 123, 220, 26, 163, 234, 54, 219, 170, 68, 226, 150, 60,
      49, 140, 43, 185, 137, 65, 12, 164, 87, 22, 235, 40, 218, 204, 211, 47,
      190, 217, 33, 234, 40, 30, 21, 71, 97, 144, 86, 42, 59, 34, 244, 222, 99,
      74, 159, 50, 1, 163, 121, 176, 6, 243, 63, 60, 131, 75, 99, 206,
    ])
  );

  let user_ATA: PublicKey;

  /** Hardcoded Public Address for the SPL Tokens */
  const kingMint = new PublicKey(
    "7zPUjQGEAiZPCiECSmZVgaiTaQHfToWw9kxr2TB7JEoM"
  );

  const funderKey = new PublicKey(
    "2nY2P1jp4kWtFU8f3xucqs3uoCiykShowADwzfeNVGbE"
  );

  // Fetch funder authority from env
  const funderKeyAuthority = Keypair.fromSecretKey(
    new Uint8Array(env_wallet)
  );

  /** Program Derived Adresses */
  const [kingVault, kingVaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("king-vault")],
    program.programId
  );

  const [kingVaultAuthority, kingVAuthBump] = PublicKey.findProgramAddressSync(
    [kingVault.toBuffer()],
    program.programId
  );

  const [stakeInfo, stakeInfoBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake-info"), userKeypair.publicKey.toBuffer()],
    program.programId
  );

  const [stakeKing, stakeKingBump] = PublicKey.findProgramAddressSync(
    [stakeInfo.toBuffer()],
    program.programId
  );

  // Fetches the number of decimals for a given token to accurately handle token amounts.
  async function getNumberDecimals(
    mintAddress: PublicKey,
    connection: Connection
  ): Promise<number> {
    const info = await connection.getParsedAccountInfo(mintAddress);
    const decimals = (info.value?.data as ParsedAccountData).parsed.info
      .decimals as number;

    return decimals;
  }

  it("it initializes $KING vault!", async () => {
    const tx = await program.methods
      .initializeVault()
      .accounts({
        signer: wallet.publicKey,
        kingVaultAccount: kingVault,
        kingVaultAuthority: kingVaultAuthority,
        mint: kingMint,
      })
      .rpc();

    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmtx = await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });
    console.log("\nYour transaction signature", tx);
  });

  it("Transfer 500 KING tokens to vault", async () => {
    const decimals = await getNumberDecimals(kingMint, connection);

    const transfer_amount = 500 * Math.pow(10, decimals);

    // Prepares the transfer instructions with all necessary information.
    const transferInstruction = createTransferInstruction(
      funderKey,
      kingVault,
      funderKeyAuthority.publicKey,
      transfer_amount
    );

    let latestBlockhash = await connection.getLatestBlockhash("confirmed");

    // Compiles and signs the transaction message with the sender's Keypair.
    const messageV0 = new TransactionMessage({
      payerKey: funderKeyAuthority.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [transferInstruction],
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(messageV0);
    versionedTransaction.sign([funderKeyAuthority]);

    // Attempts to send the transaction to the network, handling success or failure.
    try {
      const txid = await connection.sendTransaction(versionedTransaction, {
        maxRetries: 20,
      });

      const confirmation = await connection.confirmTransaction(
        {
          signature: txid,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );
      if (confirmation.value.err) {
        throw new Error("\n🚨Transaction not confirmed.\n");
      }
      console.log(
        `\nTransaction Successfully Confirmed! 🎉\nView on Solana Explorer: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    } catch (error) {
      console.error("Transaction failed", error);
    }
  });

  it("Airdrops 1 KING token to the User", async () => {
    //Get the associated token account of the user
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      userKeypair,
      kingMint,
      userKeypair.publicKey
    );

    user_ATA = ata.address;

    const tx = await program.methods
      .airdrop()
      .accounts({
        receiver: user_ATA,
        kingVaultAccount: kingVault,
        kingVaultAuthority: kingVaultAuthority,
        tokenMint: kingMint,
      })
      .rpc();

    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmtx = await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    console.log("\nAirdrop 1 KING Tokens successfully!");
    console.log(
      `\nTransaction Successfully Confirmed! 🎉
    \nView on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`
    );
  });

  it("Stakes KING successfully!", async () => {
    //Get the associated token account of the user
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      userKeypair,
      kingMint,
      userKeypair.publicKey
    );

    user_ATA = ata.address;

    const tx = await program.methods
      .stake()
      .accounts({
        user: userKeypair.publicKey,
        userAta: user_ATA,
        stakeInfoAccount: stakeInfo,
        stakeKingAccount: stakeKing,
        mint: kingMint,
      })
      .signers([userKeypair])
      .rpc();

    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmtx = await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    console.log(
      `\nTransaction Successfully Confirmed! 🎉
    \nView on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`
    );
  });

  it("Unstakes KING successfully!", async () => {
    //Get the associated token account of the user
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      userKeypair,
      kingMint,
      userKeypair.publicKey
    );

    user_ATA = ata.address;

    // Prepare the unstake instruction
    const unstake_tx = await program.methods
      .unstake()
      .accounts({
        user: userKeypair.publicKey,
        userAta: user_ATA,
        stakeInfoAccount: stakeInfo,
        stakeKingAccount: stakeKing,
        kingVaultAccount: kingVault,
        kingVaultAuthority: kingVaultAuthority,
        mint: kingMint,
      })
      .signers([userKeypair])
      .prepare();

    // Bundle the instruction together in one transaction
    const bundled_tx = await program.methods
      .closeStakingAccounts()
      .preInstructions([unstake_tx.instruction])
      .accounts({
        user: userKeypair.publicKey,
        stakeInfoAccount: stakeInfo,
        stakeKingAccount: stakeKing,
      })
      .signers([userKeypair])
      .rpc();

    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmtx = await connection.confirmTransaction({
      signature: bundled_tx,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    console.log(
      `\nTransaction Successfully Confirmed! 🎉
    \nView on Solana Explorer: https://explorer.solana.com/tx/${bundled_tx}?cluster=devnet`
    );
  });

  it("KING vault accounts closed successfully", async () => {
    // Return the funds from KING vault to funder then close the account
    const tx = await program.methods
      .closeKingVaultAccounts()
      .accounts({
        payer: wallet.publicKey,
        kingVaultAccount: kingVault,
        kingVaultAuthority: kingVaultAuthority,
        funder: funderKey,
      })
      .rpc();

    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmtx = await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    console.log("\nAccounts succesfully closed");
  });
});


