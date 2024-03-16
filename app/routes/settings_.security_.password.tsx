import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";
import { resetPassword } from "../services/auth.server";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const userSettings = await mongoose.model("User").findOne({_id: user?._id});

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
    const fetcher = useFetcher();
    return (
        <div className="content grid">
            <aside>
                <h1>Security Settings</h1>
                <SettingsNav userSettings={userSettings} />
            </aside>
            <section>
                <article>
                    <h2>Password</h2>
                    <p>Update your password.</p>
                </article>
                <fetcher.Form method="post">
                    <div>
                        <label htmlFor="password">New password</label>
                        <input type="password" id="password" name="password" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" />
                    </div>
                    <button type="submit">Update password</button>
                </fetcher.Form>
            </section>
        </div>
    )
}

export const action = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const formData = await request.formData();
    const {password, confirmPassword} = Object.fromEntries(formData);

    if(password !== confirmPassword){
        return new Response("Passwords do not match", {
            status: 400
        });
    }

    const userSettings = await mongoose.model("User").findOne({_id: user?._id});
    const email = userSettings._id;

    const passwordReset = await resetPassword({email, password});
    if(passwordReset){
        return new Response(null, {
            status: 303,
            headers: {
                "Location": "/settings/security"
            }
        });
    }else {
        return new Response("Password could not be reset", {
            status: 500
        });
    }

}