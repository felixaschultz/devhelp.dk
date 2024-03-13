import { useOutletContext } from "@remix-run/react";
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
                </div>
                <div>
                    <img src="https://via.placeholder.com/1000x550" alt="placeholder" />
                </div>
            </section>
        </article>
    );
}

export { Banner }