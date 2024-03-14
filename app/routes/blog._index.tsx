import mongoose from "mongoose";
import { Link, useLoaderData } from "@remix-run/react";
import PostCard from "~/components/PostCard";
import "../Blog.css";

export const loader = async ({ request }) => {
    const posts = await mongoose.model("BlogPost").find({
        published: true
    });
    return { posts };
};

export const meta = () => {
    return [
        {
            title: "Blog | Devhelp.dk",
            description: "Read the latest blog posts"
        }
    ]
}

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
                )).sort((a, b) => new Date(b.date) - new Date(a.date))}
            </section>
        </div>
    );
}