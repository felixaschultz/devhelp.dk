import "./Style.css";
import { Link } from "@remix-run/react";
export default function Footer() {
  return (
    <footer className="footer">
        <p className="footerText">a Intastellar Solutions, International Project. Version 1.0.0</p>
        <p className="footerText">Developed by Intastellar Solutions, International</p>
        <section className="legal">
            <a href="https://www.intastellarsolutions.com/about/legal/privacy" rel="noopener" target="_blank">Privacy Policy</a>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/imprint">Imprint</Link>
            <a href="https://github.com/felixaschultz/devhelp.dk/issues/new" rel="noopener" target="_blank">Feedback</a>
            <a href="https://github.com/felixaschultz/devhelp.dk" rel="noopener" target="_blank">Official Github</a>
        </section>
        <p className="copy">&copy; { new Date().getFullYear() } Intastellar Solutions, International. All rights reserved.</p>
    </footer>
  );
}