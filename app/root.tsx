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
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import Button from "./components/Button";
import { authenticator } from "./services/auth.server";
import mongoose from "mongoose";
import { getSession, commitSession } from "./services/session.server";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("sessionErrorKey");
  session.unset("sessionErrorKey");
  const headers = new Headers({
    "Set-Cookie": await commitSession(session),
  });
  
  return {
    user,
    error,
    headers
  };
}

export default function App() {
  const [open, setOpen] = useState({
    open: false,
    type: "login"
  });
  const fetcher = useFetcher();
  const { user, error } = useLoaderData();

  useEffect(() => {
    if(!error){
      setOpen({
        open: false,
        type: "login"
      })
    }
  }, [error, user]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header setOpen={setOpen} open={open} user={user} />
        <Outlet />
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {
            (open.open && open.type == "login") && (
                <div className="popup">
                    <div className="popup_container">
                        <Button className="close" onClick={() => setOpen(false)}>X</Button>
                        <Form action="/login" method="post">
                            <h2>Login</h2>
                            <input className="input-fields" type="email" name="mail" placeholder="Username" />
                            <input className="input-fields" type="password" name="password" placeholder="Password" />
                            <section>
                              {
                                  error?.message && (
                                      <p className="error">{error?.message}</p>
                                  )
                              }
                              <Button name="_action" value="login" className="btn no-margin">Login</Button>
                              <p>Not a member yet? <button className="ask-btn" type="button" onClick={() => setOpen({
                                  open: true,
                                  type: "signup"
                              })}>Signup</button></p>
                            </section>
                        </Form>
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
                                  error?.error && (
                                      <p>{error?.error?.message}</p>
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
  return Authenticate(request);
};

async function Authenticate(request) {
  const data = await request.formData();
  const {_action} = Object.fromEntries(data);

  if (_action === "signup") {
    return handleSignup(Object.fromEntries(data));
  }else if (_action === "logout") {
    return await authenticator.logout(request, {
      redirectTo: "/",
    });
  }
}

async function handleSignup(data) {
  const newData = {
    name: {
      firstname: data.firstname,
      lastname: data.lastname,
    },
    email: data.email,
    password: data.password,
  };

  if (newData.password !== data["repeat-password"]) {
    return json({ error: "Passwords do not match" }, { status: 400 });
  }

  delete data["repeat-password"];

  try {
    const user = await mongoose.models.User.create(newData);
    return json(user, { status: 201 }); // Return created user with status 201
  } catch (error) {
    return json({ error: error.message }, { status: 500 }); // Return error message with status 500
  }
}