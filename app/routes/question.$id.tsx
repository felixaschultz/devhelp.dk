import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "~/services/auth.server";
import Comments from "~/components/Comments";

export const loader = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request);
    const question = await mongoose.model("Question").findOne({
        _id: params.id
    });

    return {question, user};
};

export default function Question(){
    const {question, user} = useLoaderData();
    return (
        <div className="content">
            <h1>{question.title}</h1>
            <p>{question.body}</p>
            <Comments user={user} comments={question.comments} />
        </div>
    );
}