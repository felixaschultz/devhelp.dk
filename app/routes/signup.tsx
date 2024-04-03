import { authenticator, oauthLogin} from "../services/auth.server";
import mongoose from "mongoose";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import Button  from "../components/Button";

export const loader = async ({ request }) => {
    await authenticator.isAuthenticated(request, {
        successRedirect: "/",
    });


    const referrer = request.headers.get('Referer') || '/';
    const info = await request.url;
    const query = new URLSearchParams(new URL(info).search);
    const token = query.get('token');
    // Decode the token
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');

    // Now you can use the decodedToken
    const IntastellarAccount = JSON.parse(decodedToken);
    const isRegistered = await mongoose.models.User.findOne({
        email: IntastellarAccount.email
    });

    if(isRegistered){
        return await oauthLogin(isRegistered, {
            successRedirect: referrer,
            failureRedirect: referrer
        });
    }

    return { IntastellarAccount }
}

export const meta = [
    {
        title: "Signup | Devhelp.dk",
        description: "Signup to Devhelp.dk"
    }
];

export default function Signup(){
    const { IntastellarAccount, error } = useLoaderData();
    const fetcher = useFetcher();
    return (
        <div className="content">
            <fetcher.Form method="post" className="login-form">
                <h2>Registrering</h2>
                <label htmlFor="firstname">Fornavn</label>
                <input className="input-fields" type="text" name="firstname" id="firstname" placeholder="John" defaultValue={(IntastellarAccount.name.split(" ").length > 2) ? IntastellarAccount.name.split(" ")[0] + " " + IntastellarAccount.name.split(" ")[1] : IntastellarAccount.name.split(" ")[0]} />
                <label htmlFor="lastname">Efternavn</label>
                <input className="input-fields" type="text" name="lastname" id="lastname" placeholder="Doe" defaultValue={(IntastellarAccount.name.split(" ").length > 2) ? IntastellarAccount.name.split(" ")[2] : IntastellarAccount.name.split(" ")[1]} />
                <label htmlFor="email">Email</label>
                <input className="input-fields" type="email" name="email" id="email" placeholder="john@doe.com" defaultValue={IntastellarAccount.email} />
                <label htmlFor="password">Password</label>
                <input className="input-fields" type="password" name="password" id="password" placeholder="******'" />
                <label htmlFor="re-password">Repeat Password</label>
                <input className="input-fields" type="password" name="repeat-password" id="re-password" placeholder="******" />
                <input type="hidden" name="image" defaultValue={IntastellarAccount.image} />
                <section>
                    {
                        error?.error && (
                            <p>{error?.error?.message}</p>
                        )
                    }
                    <Button name="_action" value="signup" className="btn signin no-margin">Signup</Button>
                </section>
            </fetcher.Form>
        </div>
    )

}

export const action = async ({ request }) => {
    const info = await request.url;
    const query = new URLSearchParams(new URL(info).search);
    const token = query.get('token');
    // Decode the token
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');

    // Now you can use the decodedToken
    const IntastellarAccount = JSON.parse(decodedToken);
    
    const data = await request.formData();
    const userInfos = Object.fromEntries(data);
    if(!userInfos){
       return json({ error: "No data provided" }, { status: 400 });
    }
    const newData = {
        name: {
            firstname: userInfos.firstname,
            lastname: userInfos.lastname,
        },
        email: userInfos.email,
        image: userInfos.image,
        password: userInfos.password,
        linkedAccount: [
            IntastellarAccount
        ]
    };

    if (newData.password !== userInfos["repeat-password"]) {
        return json({ error: "Passwords do not match" }, { status: 400 });
    }

    delete userInfos["repeat-password"];

    try {
        const user = await mongoose.models.User.create(newData);
        return json(user, { status: 201 }); // Return created user with status 201
    } catch (error) {
        return json({ error: error.message }, { status: 500 }); // Return error message with status 500
    }
}