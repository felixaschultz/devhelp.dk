import "./Style.css";
import { Link } from "@remix-run/react";
import Button from "../Button";
export default function Header({setOpen, open}) {
    return (
        <>
        <header className="header">
            <section className="header_container">
                <Link to="/" className="header_logo">
                    <h2>Devhelp.dk</h2>
                </Link>
                <nav className="flex">
                    <Link className="navitem" to="/">Home</Link>
                    <Link className="navitem" to="/">About</Link>
                    <section className="btn_container">
                        <Button className="btn signin" onClick={() => setOpen({
                            open: !open.open,
                            type: "login" 
                        })}>Login</Button>
                        <Button className="btn" onClick={() => setOpen({
                            open: !open.open,
                            type: "signup" 
                        })}>Signup</Button>
                    </section>
                </nav>
            </section>
        </header>
        </>
    );
}