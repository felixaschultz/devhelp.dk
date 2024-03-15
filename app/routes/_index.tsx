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

  const tags = blogPosts.map(post => post.tags).flat();
  const userTags = user?.skills.map(skill => skill.name).flat();
  const tagCounts = {};
  tags.forEach(tag => {
    const newTag = tag.toLowerCase();
      if (tagCounts[newTag]) {
          tagCounts[newTag]++;
      } else {
          tagCounts[newTag] = 1;
      }
  });
  userTags.forEach(tag => {
    const newTag = tag.toLowerCase();
      if (tagCounts[newTag]) {
          tagCounts[newTag]++;
      } else {
          tagCounts[newTag] = 1;
      }
  });

  // Step 2: Convert the object to an array of [tag, count] pairs
  const tagCountPairs = Object.entries(tagCounts);

  // Step 3: Sort the array by the count in descending order
  tagCountPairs.sort((a, b) => b[1] - a[1]);

  // Step 4: Select the first 5 pairs
  const top5Pairs = tagCountPairs.slice(0, 5);

  // Step 5: Map the pairs back to just the tags
  const top5Tags = top5Pairs.map(pair => pair[0]).filter(tag => tag !== "null" && tag !== "undefined" && tag !== "");

  return (
    <>
      <Banner user={user} tags={top5Tags} />
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
        <article style={{marginTop: "100px"}}>
          <h2>Seneste Spørgsmål</h2>
          <p>Se de seneste spørgsmål stillet af vores brugere.</p>
          <section className="blog-grid">
                {(questions) ? questions.map((question) => (
                  <Link style={{textDecoration: "none", height:"max-content"}} to={`/question/${question._id}`} key={question._id}>
                    <PostCard post={question} />
                  </Link>
                )).slice(0, 9) : (
                  <p>No questions found</p>
                )}
          </section>
        </article>
      </section>
    </>
  );
}
