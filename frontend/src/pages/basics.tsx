import type { NextPage } from "next";
import Head from "next/head";
import { BasicsView } from "../views";

const Basics: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Staking Dashboard | StayKing</title>
        <meta
          name="description"
          content="Claim, stake, and unstake demo KING tokens on Solana Devnet."
        />
      </Head>
      <BasicsView />
    </div>
  );
};

export default Basics;
