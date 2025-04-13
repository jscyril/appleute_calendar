import Calendar from "./components/Calendar";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Appleute Calendar</title>
        <meta name="description" content="Appleute Calendar" />
      </Head>
      <div className="min-h-screen">
        <Calendar />
      </div>
    </>
  );
}
