import { set } from "mongoose";
import "./Style.css"
import { useOutletContext } from "@remix-run/react";

function Banner({user}) {
    const setOpen = useOutletContext();

    return (
        <article className="banner">
            <section className="banner_container">
                <div className="hero-tagline">
                    <h2>Devhelp.dk</h2>
                    <p>Din digitale platform til at hjælp andre</p>
                    {(!user) ? (
                        <div className="cta">
                            <button className="btn" onClick={() => {
                                setOpen(
                                    {
                                        open: true,
                                        type: "signup"
                                    }
                                );
                            }}>Start nu</button>
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