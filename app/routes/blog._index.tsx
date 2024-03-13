import mongoose from "mongoose";
import { Link, useLoaderData } from "@remix-run/react";
import PostCard from "~/components/PostCard";
import "../Blog.css";

export const loader = async ({ request }) => {
    const posts = await mongoose.model("BlogPost").find();
    return { posts };
};
export default function Blog() {
    const { posts } = useLoaderData();
    return (
        <div className="content">
            <h1>Blog</h1>
            <section className="blog-grid">
                {posts.map((post) => (
                    <Link style={{textDecoration: "none"}} to={`/blog/${post._id}`} key={post._id}>
                        <PostCard post={post} />
                    </Link>
                ))}
            </section>
        </div>
    );
}