import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import "./styles/App.css";
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
  useRouteError,
  isRouteErrorResponse,
  useNavigation,
  Link,
  useNavigate
} from "@remix-run/react";
import { SpeedInsights } from "@vercel/speed-insights/remix"
import { json } from "@remix-run/node";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import Button from "./components/Button";
import { authenticator,oauthAuthenticated } from "./services/auth.server";
import mongoose from "mongoose";
import { getSession, commitSession } from "./services/session.server";
import { Resend } from 'resend';
import Loader from "./components/Loader";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {
    rel: 'stylesheet',
    href: 'https://account.api.intastellarsolutions.com/insign/style.css'
  },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: 'https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-180x180.png',
  },
  {
    rel: 'icon',
    size: '57x57',
    href: 'https://www.intastellarsolutions.com/assets/icons/fav/apple-icon-57x57.png'
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: 'https://www.intastellarsolutions.com/assets/icons/fav/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: 'https://www.intastellarsolutions.com/assets/icons/fav/favicon-16x16.png',
  }
];

export const loader = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }
  const session = await getSession(request.headers.get("Cookie"));

  /* const webAuthn = await webAuthnStrategy.generateOptions(request, request.headers.get("Cookie"), user); */

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
  const { state } = useNavigation();
  const fetcher = useFetcher();
  const { user, error } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    if(open){
      const button = document.querySelector("#login");
      Intastellar.accounts.id.renderButton(button);
      if(document.querySelector(".IntastellarSignin")){
        document.querySelector(".IntastellarSignin")?.addEventListener("click", (e) => {
          e.preventDefault();
        })
      }
    }
  }, [open]);

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
        <script src="https://account.api.intastellarsolutions.com/login.js"></script>
        <Meta />
        <Links />
      </head>
      <body>
        <Header setOpen={setOpen} open={open} user={user} />
        {state === 'loading' && (
          <Loader />
        )}
        <Outlet context={[open, setOpen]} />
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <SpeedInsights />
        <LiveReload />
        {
            (open.open && open.type == "login") && (
                <div className="popup">
                    <div className="popup_container">
                        <Button className="close" onClick={() => {
                          if(sessionStorage.getItem('askButtonClicked')){
                            sessionStorage.removeItem('askButtonClicked');
                          }
                          setOpen(false);
                        }}>X</Button>
                        <section className="grid">
                          <Form action="/login" method="post" className="login-form">
                              <h2>Login</h2>
                              {
                                /* (!user.passKey) &&  */(
                                  <>
                                    <label htmlFor="mail">Email</label>
                                    <input className="input-fields" id="mail" type="email" name="mail" placeholder="john@doe.com" />
                                    <label htmlFor="password">Password</label>
                                    <input className="input-fields" id="password" type="password" name="password" placeholder="*******" />
                                    <section>
                                      {
                                          error?.message && (
                                              <p className="error">{error?.message}</p>
                                          )
                                      }
                                      <section>
                                        <Button name="_action" value="login" className="btn signin no-margin">Login</Button>
                                      </section>
                                    </section>
                                  </>
                                )
                              }
                              {/* {
                                (user.passKey) && (
                                  <section>
                                    <h2>Brug din Passkey</h2>
                                    <Button onClick={
                                        handlePasskeyCheck(user.passKey)
                                    }>Continue</Button>
                                      <p>Glemt adgangskode? <button type="button" className="rest-link" onClick={() => setOpen({
                                          open: true,
                                          type: "reset"
                                      })}>Sæt det tilbage</button></p>
                                      <p>Ikke medlem i nu? <button className="ask-btn" type="button" onClick={() => setOpen({
                                          open: true,
                                          type: "signup"
                                      })}>Registrer dig i dag</button></p>
                                    </section>
                                )
                              } */}
                              <p>Glemt adgangskode? <button type="button" className="rest-link" onClick={() => setOpen({
                                open: true,
                                type: "reset"
                            })}>Sæt det tilbage</button></p>
                          </Form>
                          <section>
                            <div id="login" data-client_id="d2eefd7f1564fa4c9714000456183a6b0f51e8c9519e1089ec41ce905ffc0c453dfac91ae8645c41ebae9c59e7a6e5233b1339e41a15723a9ba6d934bbb3e92d" data-app-name="Devhelp.dk" data-login_uri={window.location.host + "/login"}></div>
                            <p>Ikke medlem i nu? <button className="ask-btn" type="button" onClick={() => setOpen({
                                open: true,
                                type: "signup"
                            })}>Registrer dig i dag</button></p>
                          </section>
                        </section>
                    </div>
                </div>
            )
        }
        {
            (open.open && open.type == "reset") && (
                <div className="popup">
                    <div className="popup_container">
                        <Button className="close" onClick={() => setOpen(false)}>X</Button>
                        <fetcher.Form method="post">
                            <h2>Reset Password</h2>
                            <label htmlFor="email">Email</label>
                            <input className="input-fields" type="email" name="email" id="email" placeholder="john@doe.com" />
                            <section>
                              {
                                  actionData?.message && (
                                      <p>{actionData?.message}</p>
                                  )
                              }
                              <Button name="_action" value="reset" className="btn signin no-margin">Reset</Button>
                              <p>Er du medlem? <button className="ask-btn" type="button" onClick={() => setOpen({
                                  open: true,
                                  type: "login"
                              })}>Login</button></p>
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
                        <section className="grid">
                          <fetcher.Form method="post" className="login-form">
                              <h2>Registrering</h2>
                              <label htmlFor="firstname">Fornavn</label>
                              <input className="input-fields" type="text" name="firstname" id="firstname" placeholder="John" />
                              <label htmlFor="lastname">Efternavn</label>
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
                                <Button name="_action" value="signup" className="btn signin no-margin">Signup</Button>
                              </section>
                          </fetcher.Form>
                          <section>
                            <div id="login" data-client_id="d2eefd7f1564fa4c9714000456183a6b0f51e8c9519e1089ec41ce905ffc0c453dfac91ae8645c41ebae9c59e7a6e5233b1339e41a15723a9ba6d934bbb3e92d" data-app-name="Devhelp.dk" data-login-type="signup" data-login_uri={window.location.host + "/signup"}></div>
                            <p>Er du medlem? <button className="ask-btn" type="button" onClick={() => setOpen({
                                open: true,
                                type: "login"
                            })}>Login</button></p>
                          </section>
                        </section>
                    </div>
                </div>
            )
        }
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  const user = "";
  const [open, setOpen] = useState(false);
  const routeError = useRouteError();

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
        <section className="content">
        {isRouteErrorResponse(error) ? (
            <h2>
              {error?.status} – {error?.statusText}
            </h2>
          ) : routeError ? (
            <h2>
              {routeError.message}
            </h2>
          ) : error instanceof Error ? (
            <p>{error?.message}</p>
          ) : (
            <>
              <h2>Something happened.</h2>
              <p>{error?.message}</p>
            </>
          )}
          <Link to="/">Go back home</Link>
        </section>
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}


export const action = async ({ request }) => {
  /* try {
    await authenticator.authenticate("webauthn", request, {
      successRedirect: "/",
    });
    return {error: null}
  } catch (error) {
    throw new Error(error);
  } */
  return Authenticate(request);
};

async function Authenticate(request) {
  const data = await request.formData();
  const {_action} = Object.fromEntries(data);

  if (_action === "signup") {
    return handleSignup(Object.fromEntries(data));
  }else if (_action === "logout") {
    const referrer = request.headers.get('Referer') || '/';
    return await authenticator.logout(request, {
      redirectTo: referrer,
    });
  }
  if (_action === "reset") {
    const message = await handleResetPassword(data);
    return json({ message });
  }
}

async function handleResetPassword(infos) {
    const {email} = Object.fromEntries(infos);
    const resend = new Resend(process.env.RESENDGRID_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Support Devhelp.dk <account.no_reply@devhelp.dk>',
      to: email,
      subject: 'You´ve requested an Password Reset | Devhelp.dk',
      html: `
          <h1>You´ve requested a passowrd Reset</h1>
          <p>We have detected that you´ve asked for a password reset.</p>
          <p>If it wasn´t you you can forget this email.</p>
          <p>Click the link below to reset your password</p>
          <a href="http://localhost:3000/reset/${email}">Reset</a>
      `,
    });

    if (error) {
      return {
          error,
          status: 400
      };
    }else{
        return json({ message: "We´ve send you an email with an link to reset your Password." }, { status: 200 });
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