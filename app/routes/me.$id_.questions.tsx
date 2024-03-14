import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link } from "@remix-run/react";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        redirectTo: "/login"
    });

    const questionForMe = await mongoose.model("Question").find({to: user?._id});

    return {user, questionForMe};
};

export default function QuestionsToMe(){
    const {user, questionForMe} = useLoaderData();
    return (
        <div className="content">
            <Link to={`/me/${user?._id}`}>Back to profile</Link>
            <h1>Questions to me</h1>
            <ul>
                {questionForMe.map(question => (
                    <li key={question._id}>
                        <p>{question.question}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}