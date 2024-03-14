import mongoose, { set } from "mongoose";
import { authenticator } from "~/services/auth.server";
import { Form, redirect, useFetcher } from "@remix-run/react";
import { useState } from "react";
import "../BlogWrite.css";
import { uploadImage } from "~/services/uploadImage";

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
    const [image, setImage] = useState(null);
    return (
        <div className="content">
            <h1>Write a blog post</h1>
            <Form method="post" encType="multipart/form-data">
                {
                    image && (
                        <img src={image} alt="Preview" />
                    )
                }
                <div>
                    <label htmlFor="image">Image</label>
                    <input className="input-fields" type="file" id="image" name="image" onChange={(e) => {
                        setImage(URL.createObjectURL(e.target.files[0]));
                    }} />
                </div>
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

    const image = post.image;
    let newImage = null;
    if (image && image._name) {
        newImage = await uploadImage(image);
        if(!image){
            return new Response(null, {
                status: 400,
                textStatus: "Image is required",
            });
        }
    }

    post.user = user._id;
    post.image = newImage;

    const newPost = await mongoose.models.BlogPost.create(post);

    if(newPost) {
        return redirect("/blog/" + newPost._id);
    }

}