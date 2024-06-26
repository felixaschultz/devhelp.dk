import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator, oauthAuthenticated } from "~/services/auth.server";
import Comments from "~/components/Comments";
import { Resend } from "resend";

export const loader = async ({ request, params }) => {
    let user = await authenticator.isAuthenticated(request);
    if (!user) {
        user = await oauthAuthenticated(request);
    }
    const question = await mongoose.model("Question").findOne({
        _id: params.id
    }).populate("user").populate("comments.user").populate("comments.reply.user");

    return { question, user };
};

export const meta = ({ data }) => {
    return [
        {
            title: "Question: " + data.question.title + " | Devhelp.dk",
            description: data.question.body
        }
    ];
}

export default function Question() {
    const { question, user } = useLoaderData();
    return (
        <div className="content">
            <h1>Question: {question.title}</h1>
            <p className="flex">Asked by: {(question.user.image) ? <img className="comment-profileImage" src={question.user.image} alt="" /> : null}{question.user.name.firstname} {question.user.name.lastname}</p>
            <p>{question.body}</p>
            <Comments postId={question._id} user={user} post={question} />
        </div>
    );
}

export const action = async ({ request, params }) => {
    let user = await authenticator.isAuthenticated(request);
    if (!user) {
        user = await oauthAuthenticated(request);
    }
    const postId = params.id;
    const formData = await request.formData();
    const _action = formData.get("_action");

    if (!user) {
        return json(
            { message: "You need to be logged in to like a post" },
            {
                status: 401
            }
        )
    }

    if (_action === "like") {
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
            $push: {
                likes: user?.user?._id || user?._id
            }
        });
    } else if (_action === "unlike") {
        return await mongoose.model("Question").findByIdAndUpdate(postId, {
            $pull: {
                likes: user?.user?._id || user?._id
            }
        });

    } else if (_action === "comment") {
        const comment = Object.fromEntries(formData);
        comment.user = user?.user?._id || user?._id;

        const questionUser = await mongoose.model("Question").findById(postId).populate("user");
        const proUser = questionUser.user;

        const resend = new Resend(process.env.RESENDGRID_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'Support Devhelp.dk <no_reply@devhelp.dk>',
            to: proUser.email,
            subject: 'Someone comment on your Question | Devhelp.dk',
            html: `
                    <h1>Someone comment on your question</h1>
                    <p>${comment.body}</p>
                    <p>Click <a href="${process.env.HOST}/question/${postId}">here</a> to view the comment</p>
                `,
        });

        if (error) {
            console.error(error);
        }

        return await mongoose.model("Question").findByIdAndUpdate(postId, {
            $push: {
                comments: comment
            }
        });

    } else if (_action === "reply") {
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

    } else if (_action === "like-comment") {
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

    } else if (_action === "like-reply") {
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
    } else if (_action === "unlike-reply") {
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
    } else if (_action === "unlike-comment") {
        console.log("unlike-comment");
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