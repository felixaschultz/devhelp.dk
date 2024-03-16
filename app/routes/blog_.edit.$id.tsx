import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import { Form, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { useState,useRef } from "react";
import { Editor } from '@tinymce/tinymce-react';
import "../styles/BlogWrite.css";
import { uploadImage } from "~/services/uploadImage";

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
    const fetcher = useFetcher();
    const [ image, setImage ] = useState(post?.image || null);
    const [ tags, setTags ] = useState([...post?.tags]);
    const handleChange = (e) => {
        const body = e;
        const textarea = document.querySelector("textarea[name=body]");
        textarea.value = body;
    }
    const editorRef = useRef(null);

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
            <fetcher.Form method="post" encType="multipart/form-data">
                <fieldset disabled={fetcher.state === "submitting"}>
                    {
                        image && (
                            <img src={image} alt="Preview" />
                        )
                    }
                    <div>
                        <label htmlFor="image">
                            <h2>Image</h2>
                        </label>
                        <input className="input-fields" type="file" id="image" name="image" onChange={(e) => {
                            setImage(URL.createObjectURL(e.target.files[0]));
                        }} />
                        <input type="hidden" name="hiddenImage" defaultValue={post?.image || null} />
                    </div>
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
                        <Editor
                            apiKey='3ioqryb6do0jjs1dqe42hr1sf7nkuzwi1ig8qu2wx8xtvxzq'
                            onInit={(evt, editor) => editorRef.current = editor}
                            initialValue={post?.body}
                            init={{
                            height: 500,
                            menubar: false,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                            ],
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | help',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                            }}
                            onEditorChange={handleChange}
                        />
                        <textarea style={{
                            display: "none"
                        }} name="body" defaultValue={editorRef?.current?.getContent()}>
                            {editorRef.current?.getContent()}
                        </textarea>
                    </div>
                    <section className="tags">
                        <label htmlFor="tags">
                            <h2>Tags</h2>
                        </label>
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
                            }} name="tags" />
                        </section>
                        <input type="hidden" name="tags" value={
                            tags
                        } />
                        <p>Separate tags with a comma</p>
                    </section>
                    <section className="flex">
                        <button className="post-btn" type="submit">Save</button>
                    </section>
                </fieldset>
            </fetcher.Form>
        </div>
    );
}

export const action = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);

    if(!user){
        throw new Response(null, {
            status: 401,
            statusText: "Unauthorized",
        });
    }

    const postId = new mongoose.Types.ObjectId(params?.id);

    const formData = await request.formData();
    const post = Object.fromEntries(formData);
    const { _action, hiddenImage } = post;

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
            return redirect("/me/" + user._id);
        }
    }

    const image = post.image;
    let newImage = null;

    if(hiddenImage && image.size > 0) {
        if (image && image._name) {
            newImage = await uploadImage(image);
            if(!image){
                return new Response(null, {
                    status: 400,
                    statusText: "Image is required",
                });
            }
        }
    }else {
        newImage = hiddenImage;
    }
    post.image = newImage;
    post.tags = [...new Set(post.tags.split(",").map(tag => tag.trim()).filter(str => str !== ""))];

    const newPost = await mongoose.models.BlogPost.findByIdAndUpdate(postId, post);

    if(newPost) {
        return newPost
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