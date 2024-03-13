import { useLoaderData, useFetcher } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import "../Blog.css";

export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const postId = params.id;
    const post = await mongoose.model("BlogPost").findOne({ _id: postId }).populate("user");

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

    return { post, user };
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
    const {post, user} = useLoaderData();
    const fetcher = useFetcher();

    return (
        <>
            {
                post.image && (
                    <img className="post-image" src={post.image} alt={post.title} />
                )
            }
             <div className="content">
                <h1>{post.title}</h1>
                <p>By {post.user.name.firstname} {post.user.name.lastname}</p>
                {
                    post.likes && (
                        <>
                            <p>{post.likes.length} likes</p>
                            <fetcher.Form method="post">
                                {
                                    post.likes.includes(user?._id) ? (
                                        <button name="_action" value="unlike">Unlike</button>
                                    ) : (
                                        <button name="_action" value="like">Like</button>
                                    )
                                }
                            </fetcher.Form>
                        </>
                    )
                }
                {
                    post.body.split("\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))
                }
            </div>
        </>
    );
}

export const action = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const postId = params.id;
    const formData = await request.formData();
    const _action = formData.get("_action");
    
    if(_action === "like") {
        return  await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $push: {
                likes: user._id
            }
        });
    }else if(_action === "unlike") {
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $pull: {
                likes: user._id
            }
        });

    }
};