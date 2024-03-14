import { Form, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
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
    const { proUsers, user } = useLoaderData();

    const [open, setOpen] = useOutletContext();

    function handleClicked() {
        if(!user){
            setOpen(
                {
                    open: true,
                    type: "login"
                }
            );
        }

    }

    return (
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
                    <button className="btn" onClick={handleClicked}>Ask</button>
                </div>
            
            ))}
        </div>
    );
}

export const action = async ({ request }) => {
    const body = await request.formData();

    console.log(body);
    return new Response("ok");
}