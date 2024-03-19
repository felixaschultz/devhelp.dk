import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link } from "@remix-run/react";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const userSettings = await mongoose.model("User").findOne({_id: user?.user?._id})
    .   select("settings.security");

    return {user, userSettings};
};

export const meta = [
    {
        title: "Security Settings | Devhelp.dk",
        description: "Questions to me"
    }
];

export default function Settings(){
    const {user, userSettings} = useLoaderData();
    console.log(userSettings);
    return (
        <div className="content settings grid">
            <aside>
                <h1>Security Settings</h1>
                <SettingsNav userSettings={userSettings} />
            </aside>
            <section>
                <article>
                    <h2>How you sign in</h2>
                    <p>Make sure that you can always access your Intastellar Account by keeping this information up to date</p>
                    <Link className="settings-links" to="/settings/security/password">Change your password</Link>
                    <Link className="settings-links" to="/settings/security/passkeys">Passkeys</Link>
                </article>
            </section>
        </div>
    )
}