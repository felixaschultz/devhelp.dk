import mongoose from "mongoose";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";

function getCookieValue(cookieHeader, cookieName) {
    const match = cookieHeader.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    return match ? match[2] : null;
}

export const action = async ({ request }) => {
    const data = await request.json();
    const cookieHeader = request.headers.get("Cookie");
    const hasVisitedBefore = cookieHeader && cookieHeader.includes("_ca=1");
    let userID = getCookieValue(cookieHeader, "_ca") && getCookieValue(cookieHeader, "_ca").split(".")[1];
    const ip = getClientIPAddress(request.headers);
    /* const userID = cookieHeader && cookieHeader.get("_ca").split(); */

    /* Get users IP address */
    if (ip) {
        fetch(`https://ipapi.co/${ip}/json/`).then((response) => {
            return response.json();
        }).then((re) => {
            console.log(re);
        }).catch((error) => {
            console.log(error);
        });
    }

    data.forEach(async (event) => {
        if (userID === null) {
            userID = event.uniqueID;
        }

        if (event.event === "PageView") {
            const today = new Date().toISOString();
            let deviceInfo = {
                date: today,
                browser: event.device.browser,
                devicePixelRatio: event.device.devicePixelRatio,
                language: event.device.language,
                userAgent: event.device.userAgent,
                platform: event.device.platform,
                osVersion: event.device.osVersion,
                viewport: event.device.screenSize,
                screenSize: event.device.screenSize,
            };

            const timeSpendOnPage = event.timeSpendOnPage;

            // Find and update a page view for today
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            const updateObject = {
                $inc: { "data.$.totalViews": 1 },
            };

            if (!hasVisitedBefore) {
                updateObject.$push = { "data.$.uniqueViews": { view: 1, uniqueUser: userID } };
            }
            const AnalyticsModel = mongoose.model("Analytics");
            const exists = await AnalyticsModel.findOne({
                date: {
                    $gte: startOfToday,
                    $lte: endOfToday
                },
                data: {
                    $elemMatch: {
                        event: "PageView",
                    },
                }
            });

            if (!exists) {
                const pageView = await new AnalyticsModel({
                    date: today,
                    data: [
                        {
                            event: "PageView",
                            totalViews: 1,
                            spendTimeOnPage: timeSpendOnPage.current,
                            uniqueViews: hasVisitedBefore ? [] : [{ view: 1, uniqueUser: userID }],
                            title: event.title,
                            landingPage: [
                                {
                                    path: event.pathname,
                                    views: 1,
                                    pageTitle: event.title,
                                    referrer: event.referrer,
                                    timeSpendOnPage: timeSpendOnPage.current,
                                }
                            ],
                            device: [deviceInfo],
                        }
                    ]
                });

                return await pageView.save();
            }

            const pageView = await AnalyticsModel.findOneAndUpdate(
                {
                    date: {
                        $gte: startOfToday,
                        $lte: endOfToday
                    },
                    data: {
                        $elemMatch: {
                            event: "PageView",
                        },
                    }
                },
                updateObject,
                { new: true, upsert: true }
            );

            if (pageView) {
                /* Check if current path exist in the landingPage array in the data array if so increase only that page view */
                const pathExist = pageView.data.find((landingPage) => landingPage.landingPage.find((page) => page.path === event.pathname));
                if (pathExist) {
                    const pathIndex = pathExist.landingPage.findIndex((page) => page.path === event.pathname);
                    pathExist.landingPage[pathIndex].views += 1;
                    pathExist.landingPage[pathIndex].timeSpendOnPage += timeSpendOnPage.current;
                    pathExist.landingPage[pathIndex].pageTitle = event.title;
                } else {
                    /* If not existing push the new path into the landingPage array in the data array */
                    pageView.data[0].landingPage.push({
                        path: event.pathname,
                        views: 1,
                        pageTitle: event.title,
                        referrer: event.referrer,
                        timeSpendOnPage: timeSpendOnPage.current,
                    });
                }
                return await pageView.save();
            }
        }
    });

    return null;
};
