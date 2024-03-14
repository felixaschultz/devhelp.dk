import {useLoaderData, Link} from "@remix-run/react";
import mongoose from "mongoose";

export const loader = async ({request, params}) => {
    const q = request.url.split("?q=")[1];
    const items = [];
    const search = await mongoose.model("BlogPost").find(
        {
            $or: [
                {title: new RegExp(q, "i")},
                {body: new RegExp(q, "i")},
                {tags: new RegExp(q, "i")}
            ]
        }
    );

    const questions = await mongoose.model("Question").find({
        question: new RegExp(q, "i")
    });

    questions.forEach(item => {
        items.push({
            title: item.question,
            description: item.question,
            url: `/questions/${item._id}`,
            type: "question"
        });
    });

    search.forEach(item => {
        items.push({
            title: item.title,
            description: item.description,
            url: `/blog/${item._id}`,
            type: "blog"
        });
    });

    return {q, items};
}

export default function Search(){
    const {q, items} = useLoaderData();
    return (
        <div className="content">
            <h1>Search results for {q}</h1>
            <p>Found {items.length} results</p>
            {items.length === 0 && <p>No results found</p>}
            <ul>
                {items.map(item => (
                    <li key={item.url}>
                        <Link to={item.url}>
                            <p>{item.title}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}