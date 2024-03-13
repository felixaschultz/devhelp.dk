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
                <Link to="/" className="header_logo">
                    <h2>Devhelp.dk</h2>
                </Link>
                <nav className="flex">
                    <Link className="navitem" to="/">Home</Link>
                    <Link className="navitem" to="/">About</Link>
                    <section className="btn_container">
                        <Button className="btn signin" onClick={() => setOpenPop(!open)}>Login</Button>
                        <Link className="btn" to="/signup">Signup</Link>
                    </section>
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