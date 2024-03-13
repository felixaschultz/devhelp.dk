import type { MetaFunction } from "@remix-run/node";
import Header from "../components/Header";
import { Banner } from "../components/Banner";

export const meta: MetaFunction = () => {
  return [
    { title: "Digital platform for requesting help | Devhelp by Intastellar Solutiuons, International" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
      <Header />
      <Banner />
    </>
  );
}
