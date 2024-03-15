import {useLoaderData, Link, Form} from "@remix-run/react";
import mongoose from "mongoose";
import "../styles/App.css";
import "../styles/Search.css";

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

    const users = await mongoose.model("User").find({
        $or: [
            {"name.firstname": new RegExp(q, "i")},
            {"name.lastname": new RegExp(q, "i")},
            {
                "skills": {
                  $elemMatch: {
                    name: new RegExp(q, "i"),
                  }
                }
            }
        ],
        $and: [
            /* {public: true}, */
            {role: "pro"}
        ]
    });

    users.forEach(user => {
        items.push({
            title: user.name.firstname + " " + user.name.lastname,
            description: user.skills,
            url: `/me/${user._id}`,
            type: "user"
        });
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

export const meta = ({data}) => {
    return [
        {
            title: "Search results for " + data.q + " | Devhelp.dk",
            description: "Search results for " + data.q
        }
    ]
}

export default function Search(){
    const {q, items} = useLoaderData();
    return (
        <div className="content">
            <Form className="flex search" action="/search" method="GET">
                <input className="input-fields" type="text" name="q" defaultValue={q} placeholder="Søg for hjælp" />
                <button className="btn" type="submit">Søg</button>
            </Form>
            <h1>Search results for {q}</h1>
            <p>Found {items.length} results</p>
            {items.length === 0 && <p>No results found</p>}
            <ul className="search-results">
                {items.map(item => (
                    <li key={item.url}>
                        <Link className="result" to={item.url}>
                            <h3 className="type">{item.type}</h3>
                            <h2 className="title">{item.title}</h2>
                            {(item.type === "blog") && <p>{item.description}</p>}
                            {(item.type === "user") && item.description?.map(skill => (
                                <p className="skill" key={skill?.name}>{skill?.name}</p>
                            ))}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}