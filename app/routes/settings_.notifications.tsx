import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const userSettings = await mongoose.model("User").findOne({_id: user?._id})
            .select("settings.notifications")
            .select("role");

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
    const fetcher = useFetcher();

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
                                    <fetcher.Form method="post">
                                        <fieldset disabled={
                                            userSettings.role === "pro" ? false : true
                                        }>
                                            <input type="hidden" name="notification_type" value="questions_to_me" />
                                            <input type="hidden" name="enabled" value={userSettings.settings.notifications.find(notification => notification.notification_type === "questions_to_me")?.enabled} />
                                            <label htmlFor="notification_recieving">Hvordan vil du blive notificeret?</label>
                                            <select name="notification_recieving" id="notification_recieving" defaultValue={
                                                userSettings.settings.notifications.find(notification => notification.notification_type === "questions_to_me")?.receiving
                                            }>
                                                <option value="email">Email</option>
                                            </select>
                                            <button type="submit">
                                                {userSettings.settings.notifications.find(notification => notification.notification_type === "questions_to_me")?.enabled ? "Deaktiver" : "Aktiver"}
                                            </button>
                                        </fieldset>
                                    </fetcher.Form>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                }
            </div>
        </div>
    )
}

export const action = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const userSettings = await mongoose.model("User").findOne({_id: user?._id})
            .select("settings.notifications");
    const formData = await request.formData();
    const { _action, notification_type, notification_recieving, enabled } = Object.fromEntries(formData);

    
    const notificationIndex = userSettings.settings.notifications.findIndex(notification => notification.notification_type === notification_type);
    const newEnabled = enabled === "true" ? false : true;
    if(userSettings.settings.notifications[notificationIndex] === undefined){
        userSettings.settings.notifications.push(
            {
                notification_type: notification_type,
                receiving: notification_recieving,
                enabled: newEnabled
            }
        
        );
    }else{
        userSettings.settings.notifications[notificationIndex].receiving = notification_recieving;
        userSettings.settings.notifications[notificationIndex].enabled = newEnabled;
    }

    await userSettings.save();

    return json({message: "Settings updated"});
}