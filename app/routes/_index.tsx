import type { MetaFunction } from "@remix-run/node";
import { Banner } from "../components/Banner";
import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import PostCard from "~/components/PostCard";
import mongoose from "mongoose";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  const blogPosts = await mongoose.model("BlogPost").find({
    published: true
  });

  return { user, blogPosts};
};

export const meta: MetaFunction = () => {
  return [
    { title: "Digital platform for requesting help | Devhelp by Intastellar Solutiuons, International" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { user, blogPosts } = useLoaderData();

  return (
    <>
      <Banner user={user} />
      <section className="content">
        <p>Welcome to Devhelp by Intastellar Solutiuons, International</p>
        <h2>Popular Blog Posts</h2>
        <p>Read the latest blog posts</p>
        <section className="blog-grid">
          {(blogPosts) ? blogPosts
            .map(post => ({
              ...post,
              popularityScore: post.likes.length + post.comments.length + post.comments.filter(comment => comment.reply).length
            }))
            .sort((a, b) => b.popularityScore - a.popularityScore || new Date(b.date) - new Date(a.date))
            .map((post) => (
              <Link style={{textDecoration: "none"}} to={`/blog/${post._id}`} key={post._id}>
                <PostCard post={post} />
              </Link>
            )).slice(0, 9) : (
              <p>No blog posts found</p>
            )}
        </section>
      </section>
    </>
  );
}
