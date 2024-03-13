import mongoose from "mongoose";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
    const posts = await mongoose.model("BlogPost").find();
    return { posts };
};
export default function Blog() {
    const { posts } = useLoaderData();
    return (
        <div className="content">
            <h1>Blog</h1>
            <ul>
                {posts.map((post) => (
                    <li key={post._id}>
                        <a href={`/blog/${post._id}`}>{post.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}