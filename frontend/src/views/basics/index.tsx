
// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Web3
import { PublicKey, Connection, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { Stay_King } from 'components/Stay_King';

export const BasicsView: FC = ({ }) => {

  async function getTokenBalance(walletPublicKey: PublicKey, connection: Connection, tokenMintAddress: PublicKey): Promise<number> {
    const response = await connection.getTokenAccountsByOwner(walletPublicKey, {
      mint: tokenMintAddress
    });
  
    if (response.value.length === 0) return 0;
  
    const tokenAccount = response.value[0];
    const accountInfo = await connection.getParsedAccountInfo(tokenAccount.pubkey);
    const parsedAccountData = accountInfo.value?.data as ParsedAccountData;
    const tokenBalance = parsedAccountData?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
  
    return tokenBalance;
  }

  const wallet = useWallet();
  const { connection } = useConnection();

  const [tokenBalance, setTokenBalance] = useState<number>(0);

  const kingMint = new PublicKey(
      "7zPUjQGEAiZPCiECSmZVgaiTaQHfToWw9kxr2TB7JEoM"
  );

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58());
      getTokenBalance(wallet.publicKey, connection, kingMint)
        .then(balance => setTokenBalance(balance))
        .catch(err => console.error("Failed to get token balance", err));
    }
  }, [wallet.publicKey, connection]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className='mt-24'>
          <h1 className="text-center text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-green-400 mb-4">
            $KING
          </h1>
        </div>

        <div className="flex flex-col mt-2">
          <Stay_King />
          <h4 className="md:w-full text-2xl text-slate-300 my-2">
            {wallet &&
            <div className="flex flex-row justify-center">
              <div>
                {(tokenBalance || 0).toLocaleString()}
              </div>
              <div className='text-slate-600 ml-2'>
                $KING
              </div>
            </div>
            }
          </h4>
        </div>
      </div>
    </div>
  );
};

