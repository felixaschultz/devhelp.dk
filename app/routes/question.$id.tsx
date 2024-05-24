import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator, oauthAuthenticated } from "~/services/auth.server";
import Comments from "~/components/Comments";

export const loader = async ({request, params}) => {
    let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }
    const question = await mongoose.model("Question").findOne({
        _id: params.id
    }).populate("user").populate("comments.user").populate("comments.reply.user");

    return {question, user};
};

export const meta = ({data}) => {
    return [
        {
            title: data.question.title,
            description: data.question.body
        }
    ];
}

export default function Question(){
    const {question, user} = useLoaderData();
    return (
        <div className="content">
            <h1>{question.title}</h1>
            <p>{question.body}</p>
            <Comments user={user} post={question} />
        </div>
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
        return  await mongoose.model("Question").findByIdAndUpdate(postId, {
            $push: {
                likes: user?.user?._id || user?._id
            }
        });
    }else if(_action === "unlike") {
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
            $pull: {
                likes: user?.user?._id || user?._id
            }
        });

    }else if(_action === "comment") {
        const comment = Object.fromEntries(formData);
        comment.user = user?.user?._id || user?._id;
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
            $push: {
                comments: comment
            }
        });

    } else if(_action === "reply") {
        const reply = Object.fromEntries(formData);
        const commentId = formData.get("commentId");
        reply.user = user?.user?._id || user?._id;
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
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
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
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
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
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
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
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
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
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