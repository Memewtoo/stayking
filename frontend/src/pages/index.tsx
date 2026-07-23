import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>StayKing</title>
        <meta
          name="description"
          content="Learn a simplified KING token staking cycle on Solana Devnet."
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
