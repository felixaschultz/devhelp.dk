import { Form, redirect, useActionData, useFetcher, useLoaderData, useLocation, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/services/auth.server";
import mongoose, { set } from "mongoose";
import "../ProUser.css";
import { Resend } from 'resend';

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
    const actionData = useActionData();
    const [openAskForm, setOpenAskForm] = useState({
        open: false,
        profesional: "",
        pro_id: ""
    });

    const { proUsers, user } = useLoaderData();
    const [proUser, setProUser] = useState(proUsers);
    const [open, setOpen] = useOutletContext();
    const location = useLocation();

    useEffect(() => {
        if(user && location.pathname === "/ask" && sessionStorage.getItem('askButtonClicked') === 'true'){
            setOpenAskForm({
                open: true,
                profesional: "",
                pro_id: ""
            });
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
            setOpenAskForm({
                open: !openAskForm.open,
                profesional: e.target.getAttribute("data-user"),
                pro_id: e.target.getAttribute("data-userId")
            });
        }

    }

    return (
        <>
            <div className="content">
                <h1>Ask a professional</h1>
                <p>Spørg en af vores specialister indenfor deres område i kodning.</p>
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
                        <button className="btn" onClick={handleClicked} data-userId={user._id} data-user={user.name.firstname + " " + user.name.lastname}>Spørg {user.name.firstname} om hjælp</button>
                        {
                            user.skills.map((skill, index) => (
                                <p key={index}>
                                    {skill.name} - {skill.level} år
                                </p>
                            ))
                        }
                    </div>
                
                ))}
                {(openAskForm.open) && (
                    <Form className="popup" method="post">
                        <section className="popup_container">
                            <button className="close" onClick={() => setOpenAskForm({
                                open: false,
                                profesional: "",
                                pro_id: ""
                            })}>X</button>
                            <fieldset>
                                <h2>Ask a professional</h2>
                                <p>Spørg {openAskForm.profesional} for hjælp</p>
                                {actionData && (
                                    actionData?.error && (<p>{actionData?.error}</p>),
                                    actionData?.message && (<p>{actionData?.message}</p>)
                                )}
                                <input type="hidden" name="to" value={openAskForm.pro_id} />
                                <label htmlFor="title">Title</label>
                                <input className="input-fields" id="title" name="title" type="text" placeholder="Title" />
                                <label htmlFor="question">Question</label>
                                <textarea className="input-fields" id="question" name="question" placeholder={`Write your Question here...`} />
                                <section className="grid">
                                    <section>
                                        <label htmlFor="public">Vil du offentliggør dit spørgsmål?</label>
                                        <input type="checkbox" id="public" name="shouldBePublic" />
                                    </section>
                                    <button className="btn" name="_action" value="ask" type="submit">Ask</button>
                                </section>
                            </fieldset>
                        </section>
                    </Form>
                )}
            </div>
        </>
    );
}

export const action = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request);
    const body = await request.formData();
    const { title, to, question, shouldBePublic } = Object.fromEntries(body);
    const resend = new Resend(process.env.RESENDGRID_API_KEY);
    if(!user){
        return new Response("Unauthorized", {
            status: 401
        });
    }

    const newQuestion = await mongoose.model("Question").create({
        title: title,
        to: to,
        public: shouldBePublic === "on" ? true : false,
        user: user._id,
        body: question
    });

    if(!newQuestion){
        return {
            error: "Your question could not be sent",
            status: 400
        };
    }else{
        const proUser = await mongoose.model("User").findById(to);
        const { data, error } = await resend.emails.send({
            from: 'Support Devhelp.dk <info.no_reply@devhelp.dk>',
            to: proUser.email,
            subject: 'You have a new question from a user | Devhelp.dk',
            html: `
                <h1>You have a new question from a user</h1>
                <p>${user.name.firstname} ${user.name.lastname} has asked you a question</p>
                <p>Title: ${title}</p>
                <p>Question: ${question}</p>
                <p>Public: ${shouldBePublic === "on" ? "Yes" : "No"}</p>
                <a href="http://localhost:60565/question/${newQuestion._id}">See it</a>
            `,
        });

        if (error) {
            return {
                error,
                status: 400
            };
        }else{
            return {
                message: "Your question has been sent",
                status: 200
            };
        }
    }
}