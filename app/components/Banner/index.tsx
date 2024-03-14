import { Form, useOutletContext } from "@remix-run/react";
import "./Style.css"
import Logo from "../../assets/devhelp-logo-noTagLine.svg";

function Banner({user}) {
    const setOpen = useOutletContext();

    return (
        <article className="banner">
            <section className="banner_container">
                <div className="hero-tagline">
                    <img className="hero-logo" src={Logo} alt="DevHelp Logo" />
                    <p>Står du med udfordinger af dit projekt? Så står vores dygtige udvikler klar til at hjælpe dig.</p>
                    <section className="flex">
                        {(!user) ? (
                            <div className="cta">
                                <button className="btn" onClick={() => {
                                    setOpen(
                                        {
                                            open: true,
                                            type: "signup"
                                        }
                                    );
                                }}>Start i dag</button>
                            </div>
                        ): null}
                        <Form className="flex search" action="/search" method="GET">
                            <input className="input-fields" type="text" name="q" placeholder="Søg for hjælp" />
                            <button className="btn" type="submit">Søg</button>
                        </Form>
                    </section>
                </div>
                <div>
                    <img src="https://via.placeholder.com/1000x550" alt="placeholder" />
                </div>
            </section>
        </article>
    );
}

export { Banner }