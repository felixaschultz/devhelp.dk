import mongoose from "mongoose";
import { useLoaderData } from "@remix-run/react";
import { authenticator, oauthAuthenticated } from "~/services/auth.server";
import { redirect } from "@remix-run/node";
import Filter from "../components/Calendar/Filter";
import { useEffect, useState } from "react";
import "../components/Card/Styles/Card.css"

export const loader = async ({ request }) => {
    let user = await authenticator.isAuthenticated(request);
    if (!user) {
        user = await oauthAuthenticated(request);
    }

    const admin = user && user?.admin;

    if (!user || !admin) {
        return redirect("/");
    }

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const analyticsData = await mongoose.model("Analytics").find({
        date: {
            $gte: startOfYesterday,
            $lte: endOfToday
        },
        data: {
            $elemMatch: {
                event: "PageView",
            },
        }
    });

    const totalViews = analyticsData.reduce((acc, data) => {
        const pageViewEventIndex = data.data.findIndex((event) => event.event === "PageView");
        return pageViewEventIndex !== -1 ? acc + data.data[pageViewEventIndex].totalViews : acc;
    }, 0);

    const spendTimeOnPage = analyticsData.reduce((acc, data) => {
        const pageViewEventIndex = data.data.findIndex((event) => event.event === "PageView");
        return pageViewEventIndex !== -1 ? acc + data.data[pageViewEventIndex].spendTimeOnPage : acc;
    }, 0);

    const uniqueViews = analyticsData.reduce((acc, data) => {
        const pageViewEventIndex = data.data.findIndex((event) => event.event === "PageView");
        return pageViewEventIndex !== -1 ? acc + data.data[pageViewEventIndex].uniqueViews.length : acc;
    }, 0);

    const landingPages = analyticsData.reduce((acc, data) => {
        const pageViewEventIndex = data.data.findIndex((event) => event.event === "PageView");
        return pageViewEventIndex !== -1 ? acc.concat(data.data[pageViewEventIndex].landingPage) : acc;
    }, []).reduce(
        (acc, page) => {
            const existingPage = acc.find((p) => p.path === page.path);
            if (existingPage) {
                existingPage.views += page.views;
            } else {
                acc.push(page);
            }
            return acc;
        },
        []
    ).sort((a, b) => {
        return b.views - a.views;
    }).slice(0, 7);
    // Initialize acc as an empty array

    const deviceInfo = analyticsData.reduce((acc, data) => {
        const pageViewEventIndex = data.data.findIndex((event) => event.event === "PageView");
        return pageViewEventIndex !== -1 ? acc.concat(data.data[pageViewEventIndex].device) : acc;
    }, []);


    return {
        user,
        totalViews,
        uniqueViews,
        landingPages,
        deviceInfo,
        spendTimeOnPage,
        numberOfDays: 30,
        compareRange: 0,
        startXDays: startOfYesterday,
        endXDays: endOfToday,
        previousPeriod: new Date(startOfYesterday.setDate(startOfYesterday.getDate() - 1)),
        previousPeriod2: new Date(startOfYesterday.setDate(startOfYesterday.getDate() - 1))
    };
}

export const meta = [
    {
        title: "Analytics | Devhelp.dk",
        description: "Admin Analytics page for Devhelp.dk"
    }
]


export default function AdminAnalytics() {
    const {
        user,
        totalViews,
        uniqueViews,
        landingPages,
        deviceInfo,
        spendTimeOnPage,
        numberOfDays,
        compareRange,
        startXDays,
        endXDays,
        previousPeriod,
        previousPeriod2
    } = useLoaderData();
    const [numbersofDays, setNumberOfDays] = useState(numberOfDays);

    return (
        <main className="content">
            <Filter
                numberOfDays={numbersofDays}
                setNumberOfDays={setNumberOfDays}
                compareRange={compareRange}
                startDate={startXDays}
                date={
                    {
                        start: startXDays,
                        end: endXDays,
                        previousStart: previousPeriod,
                        previousEnd: previousPeriod2
                    }
                }
            />
            <h1>Admin Analytics</h1>
            <p>Admin Analytics content</p>
            <p>Total Views: {totalViews}</p>
            <p>Unique Views: {uniqueViews}</p>
            <p>Spend Time On Page: {spendTimeOnPage}</p>
            <div className="grid">
                {landingPages && (
                    <div className="card">
                        <h2>Views by Page title</h2>
                        {landingPages.map((page, index) => (
                            <div key={index}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <p>{page.pageTitle}</p>
                                    <p>{page.views}</p>
                                </div>
                                <div className="indicator" style={{
                                    width: "100%",
                                    backgroundColor: "lightgray",
                                    position: "relative",
                                    height: ".3rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}>
                                    <div style={{
                                        width: `${(page.views / totalViews) * 100}%`,
                                        backgroundColor: "rgb(192, 159, 83)",
                                        height: "100%",
                                    }}></div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {deviceInfo && (
                    <div className="card">
                        <h2>Device Info</h2>
                        {deviceInfo.map((device, index) => (
                            <div key={index}>
                                <p>Browser: {device.browser}</p>
                                <p>OS Version: {device.osVersion}</p>
                                <p>Language: {device.language}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}