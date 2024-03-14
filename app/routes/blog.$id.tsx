import { useLoaderData, useFetcher, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";
import mongoose, { set } from "mongoose";
import { authenticator } from "~/services/auth.server";
import Comments from "~/components/Comments";
import "../Blog.css";
import { useEffect } from "react";
import like from "../assets/like-icon.svg";
import likeFillOut from "../assets/like-icon-fillout.svg";

export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const postId = params.id;
    const post = await mongoose.model("BlogPost").findOne({ _id: postId }).populate("user").populate("comments.user").populate("comments.reply.user");

    if(!post.published && user?._id != post.user._id) {
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
                        <div className="likes">
                            <fetcher.Form method="post">
                                {
                                    post.likes.includes(user?._id) ? (
                                        user ? <button className="like dislike" name="_action" value="unlike"><img src={likeFillOut} className="likeIcon" alt="" /> {post.likes.length}</button> : null
                                    ) : (
                                        user ? <button className="like" name="_action" value="like"><img src={like} className="likeIcon" alt="" /> {post.likes.length}</button> : null
                                    )
                                }
                            </fetcher.Form>
                        </div>
                    )
                }
                {
                    post.body.split("\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))
                }
                <Comments post={post} user={user} />
            </div>
        </>
    );
}

export const action = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const postId = params.id;
    const formData = await request.formData();
    const _action = formData.get("_action");

    if(!user){
        return json(
            { message: "You need to be logged in to like a post" },
            {
                status: 401
            }
        )
    }
    
    if(_action === "like") {
        return  await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $push: {
                likes: user?._id
            }
        });
    }else if(_action === "unlike") {
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $pull: {
                likes: user?._id
            }
        });

    }else if(_action === "comment") {
        const comment = Object.fromEntries(formData);
        comment.user = user?._id;
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $push: {
                comments: comment
            }
        });

    } else if(_action === "reply") {
        const reply = Object.fromEntries(formData);
        const commentId = formData.get("commentId");
        reply.user = user?._id;
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $push: {
                "comments.$[comment].reply": reply
            }
        }, {
            arrayFilters: [
                {
                    "comment._id": new mongoose.Types.ObjectId(commentId)
                }
            ]
        });

    }
};