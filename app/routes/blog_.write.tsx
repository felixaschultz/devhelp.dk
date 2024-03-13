import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { Form, useFetcher } from "@remix-run/react";

export const meta = [
    { title: "Blog | Devhelp.dk" },
    { name: "description", content: "This is the blog page" }
];

export const loader = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });

    return {user};
};

export default function BlogWrite() {
    const fetch = useFetcher();
    return (
        <div className="content">
            <h1>Write a blog post</h1>
            <fetch.Form method="post">
                <div>
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" />
                </div>
                <div>
                    <label htmlFor="content">Content</label>
                    <textarea id="content" name="content" />
                </div>
                <button type="submit">Submit</button>
            </fetch.Form>
        </div>
    );
}

export function action({ request }) {
    const user = authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });

    const formData = await request.formData();
    
    /* const post = new mongoose.model("BlogPost")({
        title: formData.get("title"),
        content: formData.get("content"),
    }); */

    return json({message: "Post created"});
}