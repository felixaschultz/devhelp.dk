import { Form, useOutletContext, Link } from "@remix-run/react";
import "./Style.css"
import Logo from "../../assets/devhelp-logo.svg";
import BannerBG from "../../assets/bg.png";
import MobileBanner from "../../assets/bg-mobile.png";

function Banner({user, tags}) {
    const [open, setOpen] = useOutletContext();

    const tagCounts = {};
    tags.forEach(tag => {
        if (tagCounts[tag]) {
            tagCounts[tag]++;
        } else {
            tagCounts[tag] = 1;
        }
    });

    // Step 2: Convert the object to an array of [tag, count] pairs
    const tagCountPairs = Object.entries(tagCounts);

    // Step 3: Sort the array by the count in descending order
    tagCountPairs.sort((a, b) => b[1] - a[1]);

    // Step 4: Select the first 5 pairs
    const top5Pairs = tagCountPairs.slice(0, 5);
    console.log(tags, top5Pairs);

    // Step 5: Map the pairs back to just the tags
    const top5Tags = top5Pairs.map(pair => pair[0]);

    return (
        <article className="banner">
            <section className="banner_container">
                <div className="hero-tagline">
                    <img className="hero-logo" src={Logo} alt="DevHelp Logo" />
                    <section>
                        <h2>Vi connecter junior og senior udvikler!</h2>
                        <p>Din platform for at hjælpe og for hjælp af andre, inden for Udviklersverden.</p>
                    </section>
                    <section className="flex" style={{alignItems: "flex-start", marginTop: "20px"}}>
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
                                <p>Populær tags:</p>
                                {
                                    tags && top5Tags?.map((tag, index) => (
                                        <Link to={`/search/tags/${tag}`} key={index} className="tag">
                                            {tag}
                                        </Link>
                                        )
                                    )
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