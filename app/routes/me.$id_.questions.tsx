import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link } from "@remix-run/react";
import "../styles/Admin-pro.css";

export const loader = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const questionForMe = await mongoose.model("Question").find({to: params.id});

    return {user, questionForMe};
};

export const meta = [
    {
        title: "Questions to me | Devhelp.dk",
        description: "Questions to me"
    }
];

export default function QuestionsToMe(){
    const {user, questionForMe} = useLoaderData();
    return (
        <div className="grid grid-sidebar">
            <aside className="sidebar">
                <nav className="sidebar__navigation">
                    <Link to="/admin">Admin</Link>
                    <Link to="/admin/pro">Pro</Link>
                    <Link to="/admin/questions">Questions</Link>
                </nav>
            </aside>
            <div className="content">
                <Link to={`/me/${user?.user?._id}`}>Back to profile</Link>
                <h1>Questions to me</h1>
                
                <p>Here are the questions that have been asked to you.</p>
                {questionForMe.length === 0 && <p>No questions have been asked to you yet.</p>}
                <section className="grid">
                    {questionForMe.map(question => (
                        <Link className="question" to={`/question/${question._id}`} key={question._id}>
                            <p>{(question.public) ? "Offentlig" : "Privat"}</p>
                            <h2>{question.title}</h2>
                            <p>{question.body}</p>
                            <p>Filer: {question?.files?.length}</p>
                        </Link>
                    )).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
                </section>
            </div>
        </div>
    );
}