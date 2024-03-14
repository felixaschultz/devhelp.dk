import { Form, useFetcher, useLoaderData, useLocation, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/services/auth.server";
import mongoose from "mongoose";
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
                {proUsers.map(user => (
                    <div key={user._id}>
                        <img className="proUser-image" src={user.image} alt={user.name.firstname} />
                        <h2>{user.name.firstname} {user.name.lastname}</h2>
                        {
                            user.skills.map((skill, index) => (
                                <p key={index}>
                                    {skill.name} - {skill.level}
                                </p>
                            ))
                        }
                        <button className="btn" onClick={handleClicked}>Ask {user.name.firstname} for help</button>
                    </div>
                
                ))}
                {(openAskForm) && (
                    <Form method="post" action="/ask">
                        <input type="hidden" name="to" value={proUsers?._id} />
                        <textarea name="question" />
                        <button type="submit">Ask</button>
                    </Form>
                )}
            </div>
        </>
    );
}

export const action = async ({ request }) => {
    const body = await request.formData();

    console.log(body);
    return new Response("ok");
}