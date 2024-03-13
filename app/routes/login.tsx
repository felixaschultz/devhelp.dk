import { authenticator } from "../services/auth.server";

export const action = async ({ request }) => {
    const referrer = request.headers.get('Referer') || '/'; // Get the referrer URL or default to '/'
    await authenticator.authenticate("user-pass", request, {
        successRedirect: referrer,
        failureRedirect: referrer,
    });
};