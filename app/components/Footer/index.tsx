import "./Style.css";
export default function Footer() {
  return (
    <footer className="footer">
        <p className="footerText">a Intastellar Solutions, International Project. A non-financial project. Version 1.0.0</p>
        <p className="copy">&copy; { new Date().getFullYear() } Intastellar Solutions, International. All rights reserved.</p>
    </footer>
  );
}