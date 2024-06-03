import mongoose from "mongoose";
import { useLoaderData } from "@remix-run/react";
import { authenticator, oauthAuthenticated } from "~/services/auth.server";

export const loader = async ({ request }) => {
    let user = await authenticator.isAuthenticated(request);
    if (!user) {
        user = await oauthAuthenticated(request);
    }
    const analyticsData = await mongoose.model("Analytics").find();
    analyticsData.reduce((data) => data.date);
    return { analyticsData, user };
}

export const meta = [
    {
        title: "Analytics | Devhelp.dk",
        description: "Admin Analytics page for Devhelp.dk"
    }
]


export default function AdminAnalytics() {
    const { analyticsData } = useLoaderData();
    console.log(analyticsData);
    return (
        <main className="content">
            <h1>Admin Analytics</h1>
            <p>Admin Analytics content</p>
        </main>
    )
}