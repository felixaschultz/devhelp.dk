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
    });

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
            <Comments user={user} comments={question.comments} />
        </div>
    );
}