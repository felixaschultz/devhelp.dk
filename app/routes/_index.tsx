import type { MetaFunction } from "@remix-run/node";
import { Banner } from "../components/Banner";
import { useLoaderData, Link, Form, useFetcher } from "@remix-run/react";
import { authenticator, oauthAuthenticated } from "../services/auth.server";
import PostCard from "~/components/PostCard";
import mongoose from "mongoose";
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from "~/components/CheckoutForm";
import { useContext } from "react";
import { AppContext } from "../root";

export const loader = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }
  const blogPosts = await mongoose.model("BlogPost").find({
    published: true
  });

  const userTags = await mongoose.model("User").find().select("skills");

  const questions = await mongoose.model("Question").find({
    public: true
  });

  const amount = 1000;

  /* const createCheckoutSession = async (m) => {
    const response = await fetch("http://localhost:59746/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: m
      })
    });
    const data = await response.json();
    return data;
  }

  const clientSecret = await createCheckoutSession(amount); */

  return { user, blogPosts, questions, userTags, clientSecret: null, amount};
};

export const meta: MetaFunction = () => {
  return [
    { title: "Devhelp.dk - For din hjælp fra direkte fra en professionelt!" },
    { name: "description", content: "Din digitale partner til udvikling af Webløsninger" },
    {
      name: "og:title",
      content: "Devhelp.dk - For din hjælp fra direkte fra en professionelt!"
    },
    {
        name: "og:description",
        content: "Din digitale partner til udvikling af Webløsninger"
    },
    {
        name: "og:image",
        content: ""
    }
  ];
};

export default function Index() {
  const { user, blogPosts, questions, userTags, clientSecret, amount } = useLoaderData();
  const context = useContext(AppContext);

  const options = {
    // passing the client secret obtained from the server
    mode: "payment",
    amount: amount,
    currency: "dkk",
    description: "Donation",
    payment_method_types: ["card"],
    success_url: "https://devhelp.dk/success",
    cancel_url: "https://devhelp.dk/cancel",
    apperance: {
      theme: "auto",
      display: "popup",
      locale: "auto"
    }
  };

  const tags = blogPosts.map(post => post.tags).flat();
  const foundUserTags = userTags.map(user => user.skills).flat();
  const tagCounts = {};
  tags.forEach(tag => {
    const newTag = tag.toLowerCase();
      if (tagCounts[newTag]) {
          tagCounts[newTag]++;
      } else {
          tagCounts[newTag] = 1;
      }
  });
  foundUserTags.forEach(tag => {
    const newTag = tag.name.toLowerCase();
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

  const stripeOptions = {
    mode: "payment",
    amount: 1000,
    currency: "dkk",
  }

  return (
    <>
      <Banner user={user} tags={top5Tags} />
      <section className="content">
        {questions.length > 0 && (
          <>
            <h2>Populære Spørgsmål</h2>
            <p>Find svar på dine spørgsmål.</p>
            <section className="blog-grid">
              {questions
                .map(question => ({
                  ...question,
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((question) => (
                  <Link style={{textDecoration: "none", height:"max-content"}} to={`/question/${question._id}`} key={question._id}>
                    <PostCard post={question} />
                  </Link>
                )).slice(0, 9)}
            </section>
          </>
        )}
      </section>
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
        <Elements stripe={context.stripePromise} options={
          stripeOptions
        }>
          {/* <CheckoutForm url={clientSecret} /> */}
        </Elements>
      </section>
    </>
  );
}