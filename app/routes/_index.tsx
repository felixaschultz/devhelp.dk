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
        <h2>Recent Questions</h2>
        <h2>Recent Blog Posts</h2>
        <p>Read the latest blog posts</p>
        <section className="blog-grid">
          {(blogPosts) ? blogPosts.sort((a, b) => b.likes.length - a.likes.length).sort((a,b) => b.comments.length - a.comments.length).map((post) => (
              <Link style={{textDecoration: "none"}} to={`/blog/${post._id}`} key={post._id}>
                  <PostCard post={post} />
              </Link>
          )) : (
              <p>No blog posts found</p>
          )}
        </section>
      </section>
    </>
  );
}
