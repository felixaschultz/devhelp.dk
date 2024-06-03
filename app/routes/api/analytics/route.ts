import mongoose from "mongoose";

function getCookieValue(cookieHeader, cookieName) {
    const match = cookieHeader.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    return match ? match[2] : null;
}

export const action = async ({ request }) => {
    const data = await request.json();
    const cookieHeader = request.headers.get("Cookie");
    const hasVisitedBefore = cookieHeader && cookieHeader.includes("_ca=1");
    let userID = getCookieValue(cookieHeader, "_ca") && getCookieValue(cookieHeader, "_ca").split(".")[1];
    /* const userID = cookieHeader && cookieHeader.get("_ca").split(); */
    data.forEach(async (event) => {
        if (userID === null) {
            userID = event.uniqueID;
        }
        if (event.event === "Login") {
            const today = new Date();

            const trackingInfo = await mongoose.model("TrackingInfo").findOne({
                eventType: "Login",
                "activeUsers.userId": event.userId,
                "activeUsers.date": {
                    $gte: today.toISOString().split("T")[0],
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] // next day
                }
            });

            if (!trackingInfo) {
                await mongoose.model("TrackingInfo").findOneAndUpdate(
                    { eventType: event.event },
                    {
                        $push: {
                            activeUsers: {
                                userId: event.userId,
                                userRole: event.userRole,
                                date: today,
                            },
                        },
                    },
                    { new: true, upsert: true },
                );
            }
        }

        if (event.event === "PageView") {
            const today = new Date().toISOString();
            let deviceInfo = {
                date: today,
                browser: event.device.browser,
                devicePixelRatio: event.device.devicePixelRatio,
                language: event.device.language,
                platform: event.device.platform,
                osVersion: event.device.osVersion,
                viewport: event.device.screenSize,
            };

            const timeSpendOnPage = event.timeSpendOnPage;

            // Check if a `pageViews` object with today's date exists
            const trackingInfo = await mongoose.model("TrackingInfo").findOne({
                eventType: "PageView",
                pageViews: { $elemMatch: { date: today } },
            });
            if (trackingInfo) {
                // If the `pageViews` object exists, increment the `view` field
                if (!hasVisitedBefore) {
                    await mongoose.model("TrackingInfo").updateOne(
                        { eventType: "PageView", "pageViews.date": today },
                        {
                            $inc: { "pageViews.$.view": 1, "pageViews.$.timeSpendOnPage": timeSpendOnPage },
                            $push: { device: deviceInfo },
                        },
                    );
                } /* else{
          await mongoose.model("TrackingInfo").updateOne(
            { eventType: "PageView", "pageViews.date": today },
            { $inc: { "pageViews.$.view": 1 }}
          );
        } */
            } else {
                // If the `pageViews` object doesn't exist, add a new `pageViews` object with today's date and `view` set to 1
                await mongoose
                    .model("TrackingInfo")
                    .updateOne(
                        { eventType: "PageView" },
                        { $push: { pageViews: { date: today, view: 1, "pageViews.$.timeSpendOnPage": timeSpendOnPage } } },
                        { upsert: true },
                    );
            }
            const path = event.pathname;
            const savePageView = await mongoose.model("TrackingInfo").findOne({
                eventType: "PageView",
                viewedPages: {
                    $elemMatch: {
                        date: today,
                        path: path,
                    },
                },
            });

            if (savePageView) {
                // If the `pageViews` object exists, increment the `view` field
                await mongoose.model("TrackingInfo").updateOne(
                    {
                        eventType: "PageView",
                        "viewedPages.date": today,
                        "viewedPages.path": path,
                    },
                    {
                        $inc: { "viewedPages.$.view": 1 },
                        $set: { "viewedPages.$.title": event.title },
                    },
                );
            } else {
                // If the `pageViews` object doesn't exist, add a new `pageViews` object with today's date and `view` set to 1
                await mongoose.model("TrackingInfo").updateOne(
                    { eventType: "PageView" },
                    {
                        $push: {
                            viewedPages: {
                                date: today,
                                view: 1,
                                path: event.pathname,
                                title: event.title,
                            },
                        },
                    },
                );
            }

            // If the user has not visited the site before, increment the unique page views

            /* if (!hasVisitedBefore) { */
            let checkTrackingInfo = await mongoose
                .model("TrackingInfo")
                .findOne({ eventType: "PageView", "uniquePageViews.date": today, "uniquePageViews.userID": userID });

            if (checkTrackingInfo) {
                // If the `pageViews` object exists, increment the `view` field
                await mongoose
                    .model("TrackingInfo")
                    .updateOne(
                        { eventType: "PageView", "uniquePageViews.date": today, "uniquePageViews.userID": userID },
                        { $inc: { "uniquePageViews.$.view": 1 } },
                    );
            } else {
                // If the `pageViews` object doesn't exist, add a new `pageViews` object with today's date and `view` set to 1
                await mongoose
                    .model("TrackingInfo")
                    .updateOne(
                        { eventType: "PageView" },
                        { $push: { uniquePageViews: { date: today, view: 1, userID } } },
                        { upsert: true },
                    );
            }
            /*  } */
        }
    });

    return null;
};
