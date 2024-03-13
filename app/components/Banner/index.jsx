import { useOutletContext } from "@remix-run/react";
import { set } from "mongoose";
import "./Style.css"

function Banner({user}) {
    const setOpen = useOutletContext();

    return (
        <article className="banner">
            <section className="banner_container">
                <div className="hero-tagline">
                    <h2>DEVHELP.DK</h2>
                    <p>Vi hjælper dig med din udfordring i kodning.</p>
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