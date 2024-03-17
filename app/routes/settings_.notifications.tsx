import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link } from "@remix-run/react";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const userSettings = await mongoose.model("User").findOne({_id: user?._id})
            .select("settings.notifications");

    return {user, userSettings};
};

export const meta = [
    {
        title: "Notification Settings | Devhelp.dk",
        description: "Questions to me"
    }
];

export default function Settings(){
    const {user, userSettings} = useLoaderData();
    return (
        <div className="content grid">
            <aside>
                <h1>Notification Settings</h1>
                <SettingsNav userSettings={userSettings} />
            </aside>
            <div>
                {
                    
                    <div>
                        <h2>Notifications</h2>
                        <div>
                            <div>
                                <h3>Questions to me</h3>
                                <p>Get notified when someone asks you a question</p>
                                <div>
                                    <input type="checkbox" id="questions-to-me" name="questions-to-me" checked={
                                        userSettings?.settings?.notifications[0]?.notification_type === "new_question" && userSettings?.settings?.notifications[0]?.enabled
                                    } onChange={(e) => {
                                        console.log(e.target.checked);
                                    }} />
                                    <label htmlFor="questions-to-me">Notify me</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                }
            </div>
        </div>
    )
}