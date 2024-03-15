import { useLoaderData, Link } from "@remix-run/react";
import mongoose from "mongoose";
export const loader = async ({params}) => {
    const tag = params.tag;
    const foundItems = [];
    const items = await mongoose.models.BlogPost.find({tags: tag});
    items.forEach((item) => {
        foundItems.push(item);
    });
    return {
        tag: params.tag,
        items: items
    }
}

export default function SearchTagsTag() {
    const {tag, items} = useLoaderData();
    return (
        <div className="content">
            <h1>{tag}</h1>
            <ul className="search-results">
                {items.map(item => (
                    <li key={item.url}>
                        <Link className="result" to={item.url}>
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
    )
}