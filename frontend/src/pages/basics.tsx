import type { NextPage } from "next";
import Head from "next/head";
import { BasicsView } from "../views";

const Basics: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>StayKing</title>
        <meta
          name="description"
          content="StayKing"
        />
      </Head>
      <BasicsView />
    </div>
  );
};

export default Basics;
