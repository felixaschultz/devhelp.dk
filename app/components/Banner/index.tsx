import { Form, useOutletContext, Link } from "@remix-run/react";
import "./Style.css"
import Logo from "../../assets/devhelp-logo.svg";
import BannerBG from "../../assets/bg.png";
import MobileBanner from "../../assets/bg-mobile.png";

function Banner({user, tags}) {
    const [open, setOpen] = useOutletContext();

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
                        <article>
                            <Form className="flex search" action="/search" method="GET">
                                <input className="input-fields" type="text" name="q" placeholder="Søg for hjælp" />
                                <button className="btn" type="submit">Søg</button>
                            </Form>
                            <section className="tag-container">
                                {
                                    tags && tags?.map((tag, index) => (
                                        <Link to={`/search/tags/${tag}`} key={index} className="tag">
                                            {tag}
                                        </Link>
                                        )
                                    ).filter((tag, index) => index < 5)
                                }
                            </section>
                        </article>
                    </section>
                </div>
                <div>
                    <img src={BannerBG} srcSet={
                        `${MobileBanner} 300w,
                        ${MobileBanner} 768w,
                        ${BannerBG} 1280w,
                        ${BannerBG} 1920w`
                    } sizes="(max-width: 768px) 100vw, 50vw"
                    className="hero-img" alt="placeholder" />
                </div>
            </section>
        </article>
    );
}

export { Banner }