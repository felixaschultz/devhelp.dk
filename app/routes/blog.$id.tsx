import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";

export const loader = async ({ request, params }) => {
    const postId = params.id;
    const post = await mongoose.model("BlogPost").findOne({ _id: postId });

    if(!post) {
        throw new Error("Post not found");
    }

    return { post };
};

export default function BlogEntry() {
    const {post} = useLoaderData();
    return (
        <div className="content">
            <h1>{post.title}</h1>
            <p>{post.body}</p>
        </div>
    );
}