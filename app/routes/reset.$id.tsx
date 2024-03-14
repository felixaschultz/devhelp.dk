import mongoose from "mongoose";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export const loader = async ({request, params}) => {
    const user = await authenticator.isAuthenticated(request);

    const foundUser = await mongoose.model("User").findOne({
        email: params.id
    });

    return {foundUser, user};
};

export default function Reset(){
    const {foundUser, user} = useLoaderData();
    const fetcher = useFetcher();

    return (
        <div className="content">
            <h1>Reset password for {foundUser.email}</h1>
            <p>Reset password form</p>
            <fetcher.Form method="post">
                <input type="password" name="password" placeholder="New password" />
                <input type="password" name="password2" placeholder="Repeat new password" />
                <input type="hidden" name="id" value={foundUser._id} />
                <button type="submit">Reset password</button>
            </fetcher.Form>
        </div>
    );
}