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
      <h1>Velkommen til vores platform!</h1>
      <p>Vi er stolte af at præsentere vores lille lærings SoMe platform, hvor udviklere kan samles, dele viden og lære sammen. Med en lille, men levende blog er vores platform det perfekte sted til artikler og hjælpeartikler om udvikling, inklusive tutorials og meget mere.</p>
      <p>Vi forstår, at nogle gange kan man stå fast i udviklingsprocessen, og det er her, vores platform virkelig skinner. Ved at tilbyde muligheden for at kontakte professionelle inden for bestemte temaer, såsom Remix, giver vi vores brugere den ekstra støtte, de har brug for, når Google ikke længere er tilstrækkeligt.</p>
      <p>Men det stopper ikke der. Vores planer inkluderer integration af chatfunktioner, videoer og læringskurser, hvilket vil give vores fællesskab endnu flere værktøjer til at vokse og udvikle sig sammen.</p>
      <p>Uanset om du er en erfaren udvikler eller lige er begyndt din rejse inden for kodning, er vores platform designet til at være din go-to ressource til alt relateret til udvikling. Vi ser frem til at byde dig velkommen og være en del af din udviklingsrejse!</p>
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