import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, useNavigation } from "@remix-run/react";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";
import { useEffect } from "react";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });
    const host = new URL(request.url).host;

    const userSettings = await mongoose.model("User").findOne({_id: user?.user?._id});

    return {user, userSettings, host};
};

export const meta = [
    {
        title: "Account Settings | Devhelp.dk",
        description: "Questions to me"
    }
];

export default function Settings(){
    const {user, userSettings, host} = useLoaderData();

    useEffect(() => {
        const intaLogin = document.getElementById("inta-login");
        userSettings?.linkedAccount.length == 0 &&
        Intastellar.accounts.id.renderButton(intaLogin);
    }, []);

    return (
        <>
            <div className="content settings grid">
            <aside>
                <h1>Account Settings</h1>
                <SettingsNav userSettings={userSettings} />
            </aside>
            <div>
                <h2>Link an social account</h2>
                {
                    userSettings?.linkedAccount.length > 0 ? userSettings?.linkedAccount?.map((account, index) => {
                        return (
                            <div key={index}>
                                <h2>{account.issuer}</h2>
                                <p>{account.name}</p>
                                <p>{account.email}</p>
                            </div>
                        )
                    }) : <div id="inta-login" data-client_id="d2eefd7f1564fa4c9714000456183a6b0f51e8c9519e1089ec41ce905ffc0c453dfac91ae8645c41ebae9c59e7a6e5233b1339e41a15723a9ba6d934bbb3e92d" data-app-name="Devhelp.dk"
                            data-login_uri={host + "/api/oauth"}></div>
                    
                }
            </div>          
        </div>
        </>
    )
}