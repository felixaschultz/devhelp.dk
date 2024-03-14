import { Form, useFetcher, useLoaderData, useLocation, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/services/auth.server";
import mongoose, { set } from "mongoose";
import "../ProUser.css";

export const loader = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request);
    const proUsers = await mongoose.model("User").find({role: "pro"});
    return { proUsers, user };
}

export const meta = [
    {
        title: "Ask a professional | Devhelp.dk",
        description: "Ask a professional"
    }
]

export default function Ask() {
    const fetcher = useFetcher();
    const [openAskForm, setOpenAskForm] = useState(false);
    const [askButtonClicked, setAskButtonClicked] = useState(false);
    const { proUsers, user } = useLoaderData();
    const [proUser, setProUser] = useState(proUsers);
    const [open, setOpen] = useOutletContext();
    const location = useLocation();

    useEffect(() => {
        if(user && location.pathname === "/ask" && sessionStorage.getItem('askButtonClicked') === 'true'){
            setOpenAskForm(true);
            sessionStorage.removeItem('askButtonClicked');
        }
    }, [user, location]);

    function handleClicked(e) {
        e.preventDefault();
        if(!user){
            setOpen(
                {
                    open: true,
                    type: "login"
                }
            );
            sessionStorage.setItem('askButtonClicked', 'true');
        }else{
            setOpenAskForm(!openAskForm);
        }

    }

    return (
        <>
            <div className="content">
                <h1>Ask a professional</h1>
                <p>Here are the professionals that you can ask for help.</p>
                <section className="filter">
                    <input className="input-fields" placeholder="Search after a specific user or skill" type="search" onChange={(e) => {
                        setProUser(proUsers.filter(
                            user => 
                                user.name.firstname.toLowerCase().includes(e.target.value.toLowerCase()) 
                                || user.name.lastname.toLowerCase().includes(e.target.value.toLowerCase())
                                || user.skills.some(skill => skill.name.toLowerCase().includes(e.target.value.toLowerCase())
                            )
                        ));
                    }} />
                </section>
                {proUser.map(user => (
                    <div key={user._id}>
                        <img className="proUser-image" src={user.image} alt={user.name.firstname} />
                        <h2>{user.name.firstname} {user.name.lastname}</h2>
                        <button className="btn" onClick={handleClicked}>Ask {user.name.firstname} for help</button>
                        {
                            user.skills.map((skill, index) => (
                                <p key={index}>
                                    {skill.name} - {skill.level}
                                </p>
                            ))
                        }
                    </div>
                
                ))}
                {(openAskForm) && (
                    <Form className="popup" method="post" action="/ask">
                        <section className="popup_container">
                            <button className="close" onClick={() => setOpenAskForm(false)}>X</button>
                            <fieldset>
                                <h2>Ask a professional</h2>
                                <input type="hidden" name="to" value={proUsers?._id} />
                                <label htmlFor="question">Question</label>
                                <textarea className="input-fields" id="question" name="question" placeholder={`Write your Question here...`} />
                                <button className="btn" name="_action" value="ask" type="submit">Ask</button>
                            </fieldset>
                        </section>
                    </Form>
                )}
            </div>
        </>
    );
}

export const action = async ({ request }) => {
    const body = await request.formData();

    return new Response("ok");
}