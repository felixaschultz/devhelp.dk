import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const postId = params.id;
    const post = await mongoose.model("BlogPost").findOne({ _id: postId });

    if(!post.published && (!user || (user && user?._id != post.user))) {
        throw new Response(null, {
            status: 403,
            statusText: "Post not published"
        });
    }

    if(!post) {
        throw new Response(null, {
            status: 404,
            statusText: "Post not found"
        });
    }

    return { post };
};

export const meta = ({data}) => {

    return [
        {
            title: data.post.title + " | Blog Devhelp.dk",
            description: data.post.body
        }
    ]
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