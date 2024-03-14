export const meta = [
    { title: "About | Devhelp.dk" },
    { name: "description", content: "This is the about page" },
    {
      name: "og:title",
      content: "About | Devhelp.dk"
    },
    {
        name: "og:description",
        content: "This is the about page"
    },
    {
        name: "og:image",
        content: ""
    }
];

export default function About() {
  return (
    <div className="content">
      <h1>Om Devhelp.dk</h1>
      <p>Platformen byder på...</p>
      <section className="statements">
        <h2>Mission</h2>
        <p>Vi vil hjælpe dig med at finde den rette udvikler til dit projekt. Vi vil have værdi fuldt indhold, som man kan trække lære fra.</p>
      </section>
      <section className="statements">
        <h2>Vision</h2>
        <p>Vi vil være den foretrukne platform for at finde udviklere til projekter.</p>
      </section>
    </div>
  );
}