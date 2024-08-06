import { authenticator, oauthLogin } from "../services/auth.server";
import mongoose from "mongoose";

export const loader = async ({ request }) => {
    const referrer = request.headers.get('Referer') || '/';
    const info = await request.url;
    const query = new URLSearchParams(new URL(info).search);
    const token = query.get('token');
    // Decode the token
    /* const decodedToken = Buffer.from(token, 'base64').toString('utf-8'); */

    // Now you can use the decodedToken
    const IntastellarAccount = JSON.parse(token);

    const foundAccount = await mongoose.models.User.findOne({
        linkedAccount: {
            $elemMatch: { user_id: IntastellarAccount.user.user_id }
        }
    });

    if (foundAccount) {
        foundAccount.image = IntastellarAccount.user.avatar;
        return await oauthLogin(foundAccount, {
            successRedirect: referrer,
            failureRedirect: referrer
        });
    }
    return { foundAccount, IntastellarAccount }
};

export const action = async ({ request }) => {
    const referrer = request.headers.get('Referer') || '/'; // Get the referrer URL or default to '/'
    await authenticator.authenticate("user-pass", request, {
        successRedirect: referrer,
        failureRedirect: referrer,
    });
};