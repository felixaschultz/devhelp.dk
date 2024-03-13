import "./Style.css"

function Banner() {
  return (
    <article className="banner">
        <section className="banner_container">
            <div>
                <h2>Devhelp.dk</h2>
                <p>Din digitale platform til at hjælp andre</p>
            </div>
            <div>
                <img src="https://via.placeholder.com/150" alt="placeholder" />
            </div>
        </section>
    </article>
  );
}

export { Banner }