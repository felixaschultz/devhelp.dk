import { useLoaderData, useFetcher, useOutletContext, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator, oauthAuthenticated } from "~/services/auth.server";
import Comments from "~/components/Comments";
import "../styles/Blog.css";
import { useEffect } from "react";
import like from "../assets/like-icon.svg";
import likeFillOut from "../assets/like-icon-fillout.svg";

export const loader = async ({ request, params }) => {
    let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }
    const postId = params.id;
    const post = await mongoose.model("BlogPost").findOne({ _id: postId }).populate("user").populate("comments.user").populate("comments.reply.user");

    if(!post.published && user?.user?._id != post.user._id) {
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
    // Update the views
    post.views += 1;
    await post.save();

    const hasUserSeenPost = await mongoose.model("LookedAtLast").findOne({user: user?.user?._id, post: { $in: [postId] }});
    if(!hasUserSeenPost && user) {
        await mongoose.model("LookedAtLast").findOneAndUpdate({user: user?.user?._id}, {
            $push: {
                post: postId,
                tags: post.tags
            },
        }, {upsert: true});
    }
    
    return { post, user };
};

export const meta = ({data}) => {

    return [
        {
            title: data.post.title + " | Blog Devhelp.dk",
            description: data.post.body
        },
        {
            name: "og:title",
            content: data.post.title + " | Blog Devhelp.dk"
        },
        {
            name: "og:description",
            content: data.post.body
        },
        {
            name: "og:image",
            content: data.post.image
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
                {post.tags && (
                    <div className="tags">
                        {
                            post.tags.map((tag, index) => (
                                <Link key={index} to={"/blog?tags=" + tag} className="tag">{tag}</Link>
                            ))
                        }
                    </div>
                
                )}
                <Link className="created_by" to={"/me/" + post.user._id}>By {post.user.name.firstname} {post.user.name.lastname}</Link>
                {
                    post.likes && (
                        <div className="likes">
                            <fetcher.Form method="post">
                                {
                                    post.likes.includes(user?.user?._id) ? (
                                        <button disabled={!user} className="like dislike" name="_action" value="unlike"><img src={likeFillOut} className="likeIcon" alt="" /> {post.likes.length}</button>
                                    ) : (
                                        <button disabled={!user} className="like" name="_action" value="like"><img src={like} className="likeIcon" alt="" /> {post.likes.length}</button>
                                    )
                                }
                            </fetcher.Form>
                        </div>
                    )
                }
                {
                    post.body.split("\n").map((paragraph, index) => (
                        <div key={index} dangerouslySetInnerHTML={{
                            __html: paragraph
                        }}></div>
                    ))
                }
                <Comments post={post} user={user} />
            </div>
        </>
    );
}

export const action = async ({ request, params }) => {
    let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }
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
                likes: user?.user?._id || user?._id
            }
        });
    }else if(_action === "unlike") {
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $pull: {
                likes: user?.user?._id || user?._id
            }
        });

    }else if(_action === "comment") {
        const comment = Object.fromEntries(formData);
        comment.user = user?.user?._id || user?._id;
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $push: {
                comments: comment
            }
        });

    } else if(_action === "reply") {
        const reply = Object.fromEntries(formData);
        const commentId = formData.get("commentId");
        reply.user = user?.user?._id || user?._id;
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

    }else if(_action === "like-comment") {
        const commentId = formData.get("commentId");
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $push: {
                "comments.$[comment].likes": user?.user?._id || user?._id
            }
        }, {
            arrayFilters: [
                {
                    "comment._id": new mongoose.Types.ObjectId(commentId)
                }
            ]
        });
    
    }else if(_action === "like-reply"){
        const commentId = formData.get("commentId");
        const replyId = formData.get("replyId");
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $push: {
                "comments.$[comment].reply.$[reply].likes": user?.user?._id || user?._id
            }
        }, {
            arrayFilters: [
                {
                    "comment._id": new mongoose.Types.ObjectId(commentId)
                },
                {
                    "reply._id": new mongoose.Types.ObjectId(replyId)
                }
            ]
        });
    }else if(_action === "unlike-reply"){
        const commentId = formData.get("commentId");
        const replyId = formData.get("replyId");
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $pull: {
                "comments.$[comment].reply.$[reply].likes": user?.user?._id || user?._id
            }
        }, {
            arrayFilters: [
                {
                    "comment._id": new mongoose.Types.ObjectId(commentId)
                },
                {
                    "reply._id": new mongoose.Types.ObjectId(replyId)
                }
            ]
        });
    }else if(_action === "unlike-comment"){
        const commentId = formData.get("commentId");
        return await mongoose.model("BlogPost").findByIdAndUpdate(postId, {
            $pull: {
                "comments.$[comment].likes": user?.user?._id || user?._id
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