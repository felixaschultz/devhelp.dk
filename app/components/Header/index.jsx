import "./Style.css";
import { Link } from "@remix-run/react";
import { useState } from "react";
import Button from "../Button";
export default function Header() {
    const [open, setOpenPop] = useState(false);
    return (
        <>
        <header className="header">
            <section className="header_container">
                <div className="header_logo">
                    <h2>Devhelp.dk</h2>
                </div>
                <nav>
                    <Link className="navitem" to="/">Home</Link>
                    <Link className="navitem" to="/">Home</Link>
                    <Link className="navitem" to="/">Home</Link>
                    <Button onClick={() => setOpenPop(!open)}>Login</Button>
                </nav>
            </section>
        </header>
        {
            (open) && (
                <div className="popup">
                    <div className="popup_container">
                        <div>
                            <h2>Login</h2>
                            <input type="text" placeholder="Username" />
                            <input type="password" placeholder="Password" />
                            <Button>Login</Button>
                        </div>
                    </div>
                </div>
            )
        }
        </>
    );
}