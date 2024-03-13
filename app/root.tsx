import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import "./App.css";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Header from "./components/Header";
import { useState } from "react";
import Button from "./components/Button";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  const [open, setOpen] = useState(false);
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
                        <div>
                            <h2>Login</h2>
                            <input type="text" placeholder="Username" />
                            <input type="password" placeholder="Password" />
                            <Button>Login</Button>
                        </div>
                    </div>
                </div>
            )
        }
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export const action = async ({ request }) => {
  const formData = request.formData();
  const data = Object.fromEntries(formData);



};