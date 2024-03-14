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

  const questions = await mongoose.model("Question").find({
    public: true
  });

  return { user, blogPosts, questions};
};

export const meta: MetaFunction = () => {
  return [
    { title: "Digital platform for requesting help | Devhelp by Intastellar Solutiuons, International" },
    { name: "description", content: "Welcome to Remix!" },
    {
      name: "og:title",
      content: "Digital platform for requesting help | Devhelp by Intastellar Solutiuons, International"
    },
    {
        name: "og:description",
        content: ""
    },
    {
        name: "og:image",
        content: ""
    }
  ];
};

export default function Index() {
  const { user, blogPosts, questions } = useLoaderData();

  return (
    <>
      <Banner user={user} />
      <section className="content">
        <h2>Populær Blog Posts</h2>
        <p>Læs vores seneste indslag.</p>
        <section className="blog-grid">
          {(blogPosts) ? blogPosts
            .map(post => ({
              ...post,
              popularityScore: post.likes.length + post.comments.length + post.comments.filter(comment => comment.reply).length + post.views
            }))
            .sort((a, b) => b.popularityScore - a.popularityScore || new Date(b.date) - new Date(a.date))
            .map((post) => (
              <Link style={{textDecoration: "none", height:"max-content"}} to={`/blog/${post._id}`} key={post._id}>
                <PostCard post={post} />
              </Link>
            )).slice(0, 9) : (
              <p>No blog posts found</p>
            )}
        </section>
        <h2>Seneste Spørgsmål</h2>
        <p>Se de seneste spørgsmål stillet af vores brugere.</p>
        <section className="blog-grid">
              {(questions) ? questions.map((question) => (
                <Link style={{textDecoration: "none", height:"max-content"}} to={`/question/${question._id}`} key={question._id}>
                  <h2>{question.title}</h2>
                </Link>
              )).slice(0, 9) : (
                <p>No questions found</p>
              )}
        </section>
      </section>
    </>
  );
}
