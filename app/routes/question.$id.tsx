import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";

export const loader = async ({request, params}) => {
    const question = await mongoose.model("Question").findOne({
        _id: params.id
    });

    return {question};
};

export default function Question(){
    const {question} = useLoaderData();
    return (
        <div className="content">
            <h1>{question.title}</h1>
            <p>{question.body}</p>
        </div>
    );
}