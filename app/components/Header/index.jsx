import "./Style.css";
import { Link } from "@remix-run/react";
import Button from "../Button";
import { Form } from "@remix-run/react";
export default function Header({setOpen, open, user}) {
    return (
        <>
        <p className="underconstruction">This site is still underconstruction</p>
        <header className="header">
            <section className="header_container">
                <Link to="/" className="header_logo">
                    <h2>Devhelp.dk</h2>
                </Link>
                <nav className="flex">
                    <button className="openMenu" onClick={() => {
                        setOpen({
                            open: !open.open,
                            type: "menu"
                        })
                    }}>Menu</button>
                    <section className="flex nav" style={(open.open && open.type === "menu") ? {display: "block"} : {}} >
                        <Link className="navitem" to="/">Home</Link>
                        {
                            user ? (
                                <Link className="navitem" to="/ask">Ask</Link>
                            ) : null
                        }
                        <Link className="navitem" to="/about">About</Link>
                    </section>
                    <section className="btn_container">
                        {user ? (
                            <>
                                <Link to={"/me/" + user?._id} className="user">
                                    <img onError={(e) => {
                                        e.target.src = "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/felix.schultz@intastellar.com/profile/i3ek74fxmlnpeeazw6wadfk6lhxealofk7z6391v8a60reol0uyf4w7vic9jab2xjzmix1d3otvrsj2bv6i604id2j5j0v9nm0vlb9qv3wfb26tvw4otd0n8q49ugm4e3ew4rikm7di8qco0w33kz03nmz0r45g0bos12sbk2vra7vdmw8ewpkydo97y8f1ycr4i82eu.jpg";
                                    }} className="profileImg" src={user?.image || "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/felix.schultz@intastellar.com/profile/i3ek74fxmlnpeeazw6wadfk6lhxealofk7z6391v8a60reol0uyf4w7vic9jab2xjzmix1d3otvrsj2bv6i604id2j5j0v9nm0vlb9qv3wfb26tvw4otd0n8q49ugm4e3ew4rikm7di8qco0w33kz03nmz0r45g0bos12sbk2vra7vdmw8ewpkydo97y8f1ycr4i82eu.jpg"} alt="" />
                                    Moin, {user.name.firstname}
                                </Link>
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