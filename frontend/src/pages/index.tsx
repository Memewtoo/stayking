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
          content="Solana Scaffold Airdrop SOL"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
