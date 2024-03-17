import { authenticator } from "../services/auth.server";
import mongoose, { set } from "mongoose";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import SettingsNav from "../components/SettingsNav";
import "../styles/Admin-pro.css";
import { useEffect, useState } from "react";

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
    const [publicKey, setPublicKey] = useState("");
    const fetcher = useFetcher();

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
                <fetcher.Form method="post">
                    <div>
                        <label htmlFor="publicKey">Public key</label>
                        <input type="hidden" id="publicKey" name="publicKey" required readOnly value={publicKey} />
                    </div>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input className="input-fields" type="text" id="name" name="name" required />
                    </div>
                    <button className="btn" type="button" onClick={async (e) => {
                        e.preventDefault();
                        const passkey = await createPasskey(user);
                        setPublicKey(passkey.id);
                    }
                    }>Generate new Passkey</button>
                    <button className="btn" type="submit">Save Passkey</button>
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
    const {publicKey, name} = Object.fromEntries(formData);

    if(!publicKey){
        return new Response("No public key", {
            status: 400
        });
    }

    const passkey = {
        publicKey: publicKey,
        name: name
    }

    let userSettings = await mongoose.model("User").findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(user?._id)},
        {
            $push: {
                "settings.security.$.passkeys": passkey
            }
        },
        { new: true, upsert: true } // return the updated document
    ); 
    if(!userSettings.settings.security.passkeys){
        userSettings = await mongoose.model("User").findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(user?._id) },
            {
                $push: {
                    "settings.security.passkeys": passkey
                }
            },
            { new: true, upsert: true } // return the updated document
        );
    }
    const save = await userSettings.save();

    if(!save){
        return new Response("Could not save passkey", {
            status: 500
        });

    }

    return save;
}