import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
    PublicKey, 
    SystemProgram, 
    Connection, 
    ParsedAccountData, 
    TransactionSignature,} from '@solana/web3.js';
import { 
    Program,
    AnchorProvider,
    setProvider,
} from "@coral-xyz/anchor";
import { 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddressSync, 
} from '@solana/spl-token';
import { FC, useEffect, useMemo, useState } from 'react';
import { notify } from "../utils/notifications";
import idl from './stay_king.json';


const idl_object = JSON.parse(JSON.stringify(idl))
const programID = new PublicKey(idl.metadata.address)

export const Stay_King: FC = () => {
    const { connection } = useConnection();
    const userWallet = useWallet();

    const [walletAddress, setWalletAddress] = useState<PublicKey>();

    const getProvider = () => {
        const provider = new AnchorProvider(connection, userWallet, AnchorProvider.defaultOptions())
        setProvider(provider)

        return provider;
    }

    async function getNumberDecimals(
        mintAddress: PublicKey,
        connection: Connection
      ): Promise<number> {
        const info = await connection.getParsedAccountInfo(mintAddress);
        const decimals = (info.value?.data as ParsedAccountData).parsed.info
          .decimals as number;
    
        return decimals;
    }

    const program = useMemo(() => {
        if(connection) {
            return new Program(idl_object, programID, getProvider());
        }
    }, [connection, userWallet]);

    useEffect(() => {
        updateState()
    }, [program])
    
    const updateState = async () => {
        if(!program) return;

        try{
            if(!walletAddress) {
                // Set the wallet address
                setWalletAddress(userWallet.publicKey);
            }
        }catch(err){
            console.log(err.message);
        }
    }

    // State variables for PDA's so we can use them in different instructions whenever
    const [kingVault, setKingVault] = useState<PublicKey>();
    const [kingVaultAuth, setKingVaultAuth] = useState<PublicKey>();
    const [stakeInfo, setStakeInfo] = useState<PublicKey>();
    const [stake_King, setStake_King] = useState<PublicKey>();
    const [userATA, setUserAta] = useState<PublicKey>();
    
    /** Hardcoded Public Address for the SPL Tokens */
    const kingMint = new PublicKey(
        "7zPUjQGEAiZPCiECSmZVgaiTaQHfToWw9kxr2TB7JEoM"
    );

    useEffect(() => {
        const initKingVaultPDA = async () => {
            /** Program Derived Adresses for King Vault */
            const kingVault = PublicKey.findProgramAddressSync(
                [Buffer.from("king-vault")],
                program.programId
            );
            setKingVault(kingVault[0]);

            const kingVaultAuthority = PublicKey.findProgramAddressSync(
                [kingVault[0].toBuffer()],
                program.programId
            );
            setKingVaultAuth(kingVaultAuthority[0]);
        };

        const initUserAta = async () => {
             /** User ATA address */
            const userATA = getAssociatedTokenAddressSync(
                kingMint, 
                userWallet.publicKey);
            setUserAta(userATA);
        }

        const initStakePDA = async () => {
            /** Program Derived Adresses for Staking Accounts */
            const stakeInfo = PublicKey.findProgramAddressSync(
                [Buffer.from("stake-info"), walletAddress.toBuffer()],
                program.programId
            );
            setStakeInfo(stakeInfo[0]);

            const stake_King = PublicKey.findProgramAddressSync(
                [stakeInfo[0].toBuffer()],
                program.programId
            );
            setStake_King(stake_King[0]);
        };

        if (program && walletAddress) {
            initKingVaultPDA();
            initUserAta();
            initStakePDA();
        }
    }, [program, walletAddress]);

    const initStakePDA = async () => {
        /** Program Derived Adresses for Staking Accounts */
        const stakeInfo = PublicKey.findProgramAddressSync(
            [Buffer.from("stake-info"), walletAddress.toBuffer()],
            program.programId
            );
        setStakeInfo(stakeInfo[0]);
        
        const stake_King = PublicKey.findProgramAddressSync(
        [stakeInfo[0].toBuffer()],
        program.programId
        );
        setStake_King(stake_King[0]);
    }

    /** Program Calls */

    // Airdrop
    const airdropKING = async () => {
        let signature: TransactionSignature = "";

        try{
            const anchProvider = getProvider();
            
            console.log("Program ID:", program.programId.toBase58());

            // Prepare initialize user ATA instruction
            const ata_init_tx = await program.methods.initializeAssociatedTokenAccount()
                .accounts({
                    user: userWallet.publicKey,
                    userAta: userATA,
                    tokenMint: kingMint,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
                })
                .prepare()

            // Bundle past instructions and airdrop instruction in 1 transaction
            const airdrop_tx = await program.methods.airdrop()
                .preInstructions([ata_init_tx.instruction])
                .accounts({
                    receiver: userATA,
                    kingVaultAccount: new PublicKey(kingVault),
                    kingVaultAuthority: new PublicKey(kingVaultAuth),
                    tokenMint: kingMint,
                    tokenProgram: TOKEN_PROGRAM_ID
                })
                .rpc();
            
            const latestBlockHash = await connection.getLatestBlockhash();

            const confirmtx = await connection.confirmTransaction({
                signature: airdrop_tx,
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            });

            signature = airdrop_tx;

            notify({ type: 'success', message: 'Airdropped 1 KING successfully!', txid: signature });

            console.log(
                `\nTransaction Successfully Confirmed! 🎉
              \nView on Solana Explorer: https://explorer.solana.com/tx/${airdrop_tx}?cluster=devnet`
            );
        }catch(e: any){
            notify({ type: 'error', message: `Stake failed!`, description: e?.message, txid: signature });
                    console.log('error', `Stake failed! ${e?.message}`, signature);
        }
    }

    // Stake
    const stakeKING = async () => {
        let signature: TransactionSignature = "";

        try{
            const stake_tx = await program.methods.stake()
            .accounts({
                user: userWallet.publicKey,
                userAta: userATA,
                stakeInfoAccount: stakeInfo,
                stakeKingAccount: stake_King,
                mint: kingMint,
            })
            .rpc();

            const latestBlockHash = await connection.getLatestBlockhash();

            const confirmtx = await connection.confirmTransaction({
                signature: stake_tx,
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            });

            signature = stake_tx;

            notify({ type: 'success', message: 'Staked 1 KING successfully!', txid: signature });

            console.log(
                `\nTransaction Successfully Confirmed! 🎉
              \nView on Solana Explorer: https://explorer.solana.com/tx/${stake_tx}?cluster=devnet`
            );
        }catch(e: any){
            notify({ type: 'error', message: `Stake failed!`, description: `You are currently already staking....`, txid: signature });
                    console.log('error', `Stake failed! ${e?.message}`, signature);
        }
    }

    // Unstake
    const unstakeKing = async () => {
        let signature: TransactionSignature = "";

        try{
            // Prepare the close of Staking Accounts instruction
            const close_staking_accounts_tx = await program.methods
            .closeStakingAccounts()
            .accounts({
                user: userWallet.publicKey,
                stakeInfoAccount: stakeInfo,
                stakeKingAccount: stake_King,
            })
            .prepare();

            // Bundle the past instruction and unstake instruction into one transaction
            const unstake_tx = await program.methods.unstake()
            .postInstructions([close_staking_accounts_tx.instruction])
            .accounts({
                user: userWallet.publicKey,
                userAta: userATA,
                stakeInfoAccount: stakeInfo,
                stakeKingAccount: stake_King,
                kingVaultAccount: kingVault,
                kingVaultAuthority: kingVaultAuth,
                mint: kingMint,
            })
            .rpc();

            const latestBlockHash = await connection.getLatestBlockhash();

            const confirmtx = await connection.confirmTransaction({
                signature: unstake_tx,
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            });

            signature = unstake_tx;

            notify({ type: 'success', message: 'Unstaked successfully!', description:"You have been rewarded 1 KING", txid: signature });

            console.log(
                `\nTransaction Successfully Confirmed! 🎉
              \nView on Solana Explorer: https://explorer.solana.com/tx/${unstake_tx}?cluster=devnet`
            );
        }catch(e: any){
            notify({ type: 'error', message: `Unstake failed!`, description: "You are currently not staking anything.....", txid: signature });
                    console.log('error', `Unstake failed! ${e?.message}`, signature);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex flex-row space-x-4">
            <div className="relative group items-center">
              <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-green-400
                rounded-full blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              
              <button
                className="group py-3 px-16 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black rounded-full focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                onClick={stakeKING}
              >
                Stake{/*  <span className="pl-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-green-400">$KING</span> */}
              </button>
            </div>
            <div className="relative group items-center">
              <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-green-400
                rounded-full blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              
              <button
                className="group py-3 px-14 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black rounded-full focus:ring transform transition hover:scale-105 duration-300 ease-in-out"
                onClick={unstakeKing}
              >
                Unstake{/*  <span className="pl-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-green-400">$KING</span> */}
              </button>
            </div>
          </div>
          <p className="text-sm font-sans font-bold text-white pt-3 underline hover:no-underline">
            <a href='#' onClick={airdropKING}>Don't have $KING?</a>
          </p>
        </div>
    );
};

