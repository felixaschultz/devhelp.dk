import { Form, useOutletContext, Link } from "@remix-run/react";
import "./Style.css"
import Logo from "../../assets/devhelp-logo.svg";
import BannerBG from "../../assets/bg.png";
import MobileBanner from "../../assets/bg-mobile.png";
import { useEffect } from "react";
import { set } from "mongoose";

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

    // Step 5: Map the pairs back to just the tags
    const top5Tags = top5Pairs.map(pair => pair[0]);

    function RolledText(){
        const rolledText = document.getElementById("rolled-text");
        const text = [
            "verdens bedste",
            "verdens mest erfarne",
            "junior og senior",
        ];
        let i = 0;
        setInterval(() => {
            rolledText.style.transform = '0';

            setTimeout(() => {
                // Change the text
                rolledText.textContent = text[i];

                // Fade in the new text
                rolledText.style.opacity = '1';

                i++;
                if(i === text.length){
                    i = 0;
                }
            }, 500);
        }, 3000);
    }

    useEffect(() => {
        RolledText();
    }, []);

    return (
        <article className="banner">
            <section className="banner_container">
                <div className="hero-tagline">
                    <img className="hero-logo" src={Logo} alt="DevHelp Logo" />
                    <section>
                        <h2 className="hero-heading">Vi forbinder <span id="rolled-text" className="highlightedText">junior og senior</span> udvikler</h2>
                        <p>Vi forstår, at nogle gange kan man stå fast i udviklingsprocessen, og det er her, vores platform virkelig skinner.</p>
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
                        <article className="search-container">
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
                        ${BannerBG} 768w,
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