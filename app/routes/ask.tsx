import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import "../ProUser.css";

export const loader = async ({ params }) => {
    const proUsers = await mongoose.model("User").find({role: "pro"});
    return { proUsers };
}

export const meta = [
    {
        title: "Ask a professional | Devhelp.dk",
        description: "Ask a professional"
    }
]

export default function Ask() {
    const fetcher = useFetcher();
    const { proUsers } = useLoaderData();

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