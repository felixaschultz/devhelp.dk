import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link } from "@remix-run/react";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const userSettings = await mongoose.model("User").findOne({_id: user?.user?._id || user?._id});

    return {user, userSettings};
};

export const meta = [
    {
        title: "Billing Settings | Devhelp.dk",
        description: "Questions to me"
    }
];

export default function Settings(){
    const {user, userSettings} = useLoaderData();
    return (
        <div className="content settings grid">
            <aside>
                <h1>Billing Settings</h1>
                <SettingsNav userSettings={userSettings} />
            </aside>
            <div>
                
            </div>
        </div>
    )
}