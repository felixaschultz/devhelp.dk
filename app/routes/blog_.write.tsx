import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { Form, redirect, useFetcher } from "@remix-run/react";
import "../BlogWrite.css";

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
    return (
        <div className="content">
            <h1>Write a blog post</h1>
            <Form method="post">
                <div>
                    <label htmlFor="title">Title</label>
                    <input className="input-fields" type="text" id="title" name="title" />
                </div>
                <div>
                    <label htmlFor="content">Content</label>
                    <textarea className="input-fields textarea" id="content" name="body" />
                </div>
                <section className="flex">
                    <button className="post-btn" type="submit">Submit</button>
                </section>
            </Form>
        </div>
    );
}

export const action = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });

    const formData = await request.formData();
    const post = Object.fromEntries(formData);

    post.user = user._id;

    const newPost = await mongoose.models.BlogPost.create(post);

    if(newPost) {
        return redirect("/blog/" + newPost._id);
    }

}