import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { Form, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import "../BlogWrite.css";

export const meta = [
    { title: "Blog | Devhelp.dk" },
    { name: "description", content: "This is the blog page" }
];

export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });

    const postId = new mongoose.Types.ObjectId(params?.id);
    const userId = new mongoose.Types.ObjectId(user?._id);

    const post = await mongoose.model("BlogPost").findOne({ _id: postId, user: userId });

    return {user, post};
};

export default function BlogEdit() {
    const {user, post} = useLoaderData();

    return (
        <div className="content">
            <h1>Edit a blog post</h1>
            <Form method="post" onSubmit={handelSubmit}>
                <button name="_action" value="delete" className="delete-btn">Delete</button>
                <button name="_action" value={
                    post?.published ? "unpublish" : "publish"
                } className="delete-btn">{
                    post?.published ? "Unpublish" : "Publish"
                }</button>
            </Form>
            <Form method="post">
                <div>
                    <label htmlFor="title">
                        <h2>Title</h2>
                    </label>
                    <input className="input-fields" type="text" id="title" name="title" defaultValue={post?.title} />
                </div>
                <div>
                    <label htmlFor="content">
                        <h2>Content</h2>
                    </label>
                    <textarea className="input-fields textarea" id="content" name="body" defaultValue={post?.body} />
                </div>
                <section className="flex">
                    <button className="post-btn" type="submit">Submit</button>
                </section>
            </Form>
        </div>
    );
}

export const action = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });

    const postId = new mongoose.Types.ObjectId(params?.id);

    const formData = await request.formData();
    const post = Object.fromEntries(formData);
    const { _action } = post;

    if(_action === "delete") {
        const deletedPost = await mongoose.models.BlogPost.findByIdAndDelete(postId);
        if(deletedPost) {
            return redirect("/me/" + user._id);
        }
    }else if(_action === "publish") {
        const publishedPost = await mongoose.models.BlogPost.findByIdAndUpdate(postId, { published: true });
        if(publishedPost) {
            return redirect("/blog/" + publishedPost._id);
        }
    }else if(_action === "unpublish") {
        const publishedPost = await mongoose.models.BlogPost.findByIdAndUpdate(postId, { published: false });
        if(publishedPost) {
            return redirect("/blog/" + publishedPost._id);
        }
    }

    const newPost = await mongoose.models.BlogPost.findByIdAndUpdate(postId, post);

    if(newPost) {
        return redirect("/blog/" + newPost._id);
    }

}

function handelSubmit(e) {
    const value = e.nativeEvent.submitter.value;
    if(value === "delete" && !confirm(`Are you sure, you want to delete this event?`)){
        e.preventDefault();
    }else if(value === "publish" && !confirm(`Are you sure, you want to make this event ${e.nativeEvent.submitter.innerText.indexOf("Publish") > -1 ? "public" : "private"}?`)){
        e.preventDefault();
    }
}