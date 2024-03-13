import type { MetaFunction } from "@remix-run/node";
import { Banner } from "../components/Banner";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return { user };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Digital platform for requesting help | Devhelp by Intastellar Solutiuons, International" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { user } = useLoaderData();

  return (
    <>
      <Banner user={user} />
      <section className="content">
        <p>Welcome to Devhelp by Intastellar Solutiuons, International</p>
      </section>
    </>
  );
}
