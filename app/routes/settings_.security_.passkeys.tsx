import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import { useLoaderData, Link } from "@remix-run/react";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";
import { useEffect } from "react";

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

    const passkeys = userSettings?.settings?.security?.passkeys;

    async function createPasskey(user){
        if(window.PublicKeyCredential &&
            window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable){
                Promise.all(
                window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),  
                window.PublicKeyCredential.isConditionalMediationAvailable(),
                ).then((result) => {
                
                })
                const publicKeyCredentialCreationOptions = {
                    challenge: new Uint8Array(32),
                    rp: {
                    id: "devhelp.dk",
                    name: "Devhelp.dk | Intastellar Solutions, International",
                    },
                    user: {
                    id: new Uint8Array(32),
                    name: user.email,
                    displayName: user.name,
                    },
                    pubKeyCredParams: [
                    {
                        type: "public-key",
                        alg: -7,
                    },
                    {
                        type: "public-key",
                        alg: -257,
                    },
                    ],
                    excludeCredentials: [{  
                    id: new Uint8Array([117, 61, 252, 231, 191, 241, 23]),  
                    type: 'public-key',  
                    transports: ['internal'],  
                    }],  
                    authenticatorSelection: {  
                        authenticatorAttachment: "platform",  
                        requireResidentKey: true, 
                        userVerification: "preferred" 
                    }
                };
                const credential = navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions })
        
                return credential;
        }
    }

    return (
        <div className="content settings grid">
            <aside>
                <h1>Security Settings</h1>
                <SettingsNav userSettings={userSettings} />
            </aside>
            <section>
                <h2>Passkeys</h2>
                <p>Passkeys are a way to secure your account. You can use them to authenticate with the API or to login to your account.</p>
                <button onClick={() => {
                    createPasskey(user);
                }}>Create Passkey</button>
            </section>
        </div>
    )
}

export const action = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });

    const userSettings = await mongoose.model("User").findOne({_id: user?._id});

    return {
        location: "/settings/security/passkeys",
        data: {user, userSettings}
    };
}