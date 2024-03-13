import { authenticator } from "~/services/auth.server";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const userId = new mongoose.Types.ObjectId(user.id || params.id);

    const userData = await mongoose.model("User").findOne({ _id: userId });
    
    if(!userData) {
        throw new Error("User not found");
    }

    return { user, userData };
}
export const meta = [
    { title: "Me | Devhelp.dk" },
    { name: "description", content: "This is the me page" },
];

export default function Me() {
    const { user, userData } = useLoaderData();
    return (
        <div>
            <img src={user.image || "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/felix.schultz@intastellar.com/profile/i3ek74fxmlnpeeazw6wadfk6lhxealofk7z6391v8a60reol0uyf4w7vic9jab2xjzmix1d3otvrsj2bv6i604id2j5j0v9nm0vlb9qv3wfb26tvw4otd0n8q49ugm4e3ew4rikm7di8qco0w33kz03nmz0r45g0bos12sbk2vra7vdmw8ewpkydo97y8f1ycr4i82eu.jpg"} alt="" />
            <h1>{user.name.firstname}</h1>
        </div>
    );
}