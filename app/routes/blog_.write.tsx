import mongoose, { set } from "mongoose";
import { authenticator } from "~/services/auth.server";
import { Form, redirect, useFetcher } from "@remix-run/react";
import { useState } from "react";
import "../styles/BlogWrite.css";
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
    const [ tags, setTags ] = useState([]);
    const fetcher = useFetcher();
    return (
        <div className="content">
            <h1>Write a blog post</h1>
            <fetcher.Form method="post" encType="multipart/form-data">
                <fieldset disabled={fetcher.state === "submitting"}>
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
                    <section className="tag-container">
                        {
                            tags && tags?.map((tag, index) => (
                                <span key={index} className="tag">
                                    {tag}
                                    <button type="button" onClick={(e) => {
                                        e.preventDefault();
                                        setTags(tags.filter((t, i) => i !== index));
                                    }}>
                                        X
                                    </button>
                                </span>
                            )).reverse()
                        }
                        <input className="input-fields" type="text" id="tags" placeholder="add a tag" onChange={(e) => {
                            if(e.target.value.indexOf(",") !== -1){
                                if(e.target.value.split(",")[0].trim() !== ""){
                                    setTags([e.target.value.split(","), ...tags]);
                                    e.target.value = "";
                                }
                            }
                        }} />
                        <input type="hidden" name="tags" value={
                            tags
                        } />
                    </section>
                    <section className="flex">
                        <button className="post-btn" type="submit">Submit</button>
                    </section>
                </fieldset>
            </fetcher.Form>
        </div>
    );
}

export const action = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request);

    if(!user){
        throw new Response(null, {
            status: 401,
            statusText: "Unauthorized",
        });
    }

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
    post.tags = [...new Set(post.tags.split(",").map(tag => tag.trim()))];

    const newPost = await mongoose.models.BlogPost.create(post);

    if(newPost) {
        return redirect("/blog/" + newPost._id);
    }

}