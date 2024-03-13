import "./Style.css";
import { Link } from "@remix-run/react";
import Button from "../Button";
import { Form } from "@remix-run/react";
export default function Header({setOpen, open, user}) {
    return (
        <>
        <header className="header">
            <section className="header_container">
                <Link to="/" className="header_logo">
                    <h2>Devhelp.dk</h2>
                </Link>
                <nav className="flex">
                    <Link className="navitem" to="/">Home</Link>
                    <Link className="navitem" to="/about">About</Link>
                    <section className="btn_container">
                        {user ? (
                            <>
                                <Link to="/profile" className="btn">Profile</Link>
                                <Form method="post">
                                    <Button name="_action" value="logout" className="btn" type="submit">Logout</Button>
                                </Form>
                            </>
                        ) : 
                            <>
                                <Button className="btn signin" onClick={() => setOpen({
                                    open: !open.open,
                                    type: "login" 
                                })}>Login</Button>
                                <Button className="btn" onClick={() => setOpen({
                                    open: !open.open,
                                    type: "signup" 
                                })}>Signup</Button>
                            </>
                        }
                        
                    </section>
                </nav>
            </section>
        </header>
        </>
    );
}