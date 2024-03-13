import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import "./App.css";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import Header from "./components/Header";
import { useState } from "react";
import Button from "./components/Button";
import { authenticator } from "./services/auth.server";
import { getSession, commitSession } from "./services/session.server";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("sessionErrorKey");
  session.unset("sessionErrorKey");

  const headers = new Headers({
    "Set-Cookie": await commitSession(session),
  });

  return json({ error }, { headers })
}

export default function App() {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();
  const loaderData = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header setOpen={setOpen} open={open} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {
            (open) && (
                <div className="popup">
                    <div className="popup_container">
                        <Button className="close" onClick={() => setOpen(false)}>X</Button>
                        <fetcher.Form method="post">
                            <h2>Login</h2>
                            <input className="input-fields" type="email" name="mail" placeholder="Username" />
                            <input className="input-fields" type="password" name="password" placeholder="Password" />
                            <section className="flex">
                              {
                                  loaderData?.error && (
                                      <p>{loaderData?.error?.message}</p>
                                  )
                              }
                              <Button className="btn">Login</Button>
                            </section>
                        </fetcher.Form>
                    </div>
                </div>
            )
        }
      </body>
    </html>
  );
}

export const action = async ({ request }) => {
  
  return authenticator.authenticate("user-pass", request, {
    successRedirect: "/my-events",
    failureRedirect: "/",
  })

};