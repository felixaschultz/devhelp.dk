import type { MetaFunction } from "@remix-run/node";
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
      <Banner />
    </>
  );
}
