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
import mongoose from "mongoose";

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
  const [open, setOpen] = useState({
    open: false,
    type: "login"
  });
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
            (open.open && open.type == "login") && (
                <div className="popup">
                    <div className="popup_container">
                        <Button className="close" onClick={() => setOpen(false)}>X</Button>
                        <fetcher.Form method="post">
                            <h2>Login</h2>
                            <input className="input-fields" type="email" name="mail" placeholder="Username" />
                            <input className="input-fields" type="password" name="password" placeholder="Password" />
                            <section>
                              {
                                  loaderData?.error && (
                                      <p>{loaderData?.error?.message}</p>
                                  )
                              }
                              <Button name="_action" value="login" className="btn no-margin">Login</Button>
                              <p>Not a member yet? <button className="ask-btn" type="button" onClick={() => setOpen({
                                  open: true,
                                  type: "signup"
                              })}>Signup</button></p>
                            </section>
                        </fetcher.Form>
                    </div>
                </div>
            )
        }
        {
            (open.open && open.type == "signup") && (
                <div className="popup">
                    <div className="popup_container">
                        <Button className="close" onClick={() => setOpen(false)}>X</Button>
                        <fetcher.Form method="post">
                            <h2>Signup</h2>
                            <label htmlFor="firstname">Firstname</label>
                            <input className="input-fields" type="text" name="firstname" id="firstname" placeholder="John" />
                            <label htmlFor="lastname">Lastname</label>
                            <input className="input-fields" type="text" name="lastname" id="lastname" placeholder="Doe" />
                            <label htmlFor="email">Email</label>
                            <input className="input-fields" type="email" name="email" id="email" placeholder="john@doe.com" />
                            <label htmlFor="password">Password</label>
                            <input className="input-fields" type="password" name="password" id="password" placeholder="******'" />
                            <label htmlFor="re-password">Repeat Password</label>
                            <input className="input-fields" type="password" name="repeat-password" id="re-password" placeholder="******" />
                            <section>
                              {
                                  loaderData?.error && (
                                      <p>{loaderData?.error?.message}</p>
                                  )
                              }
                              <Button name="_action" value="signup" className="btn no-margin">Signup</Button>
                              <p>Already a member? <button className="ask-btn" type="button" onClick={() => setOpen({
                                  open: true,
                                  type: "login"
                              })}>Signin</button></p>
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
    const formData = await request.formData();
    const { mail, password, name, _action } = Object.fromEntries(formData);

    if(_action == "signup"){
      const data = Object.fromEntries(formData);

      if(data.password !== data["repeat-password"]){
        return json({error: "Passwords do not match"}, {
          status: 400
        })
      
      }

      delete data["repeat-password"];
      await mongoose.models.User.create(data);

    }else if(_action == "login"){
      return authenticator.authenticate("user-pass", request, {
        successRedirect: "/",
        failureRedirect: "/",
      })
    }
  

};