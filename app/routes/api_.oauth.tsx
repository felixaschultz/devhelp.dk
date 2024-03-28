import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";
export const loader = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request);
    const referrer = request.headers.get('Referer') || '/';
    const info = await request.url;
    const query = new URLSearchParams(new URL(info).search);
    const token = query.get('token');
    // Decode the token
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const IntastellarAccount = JSON.parse(decodedToken);
    
    const foundAccount = await mongoose.models.User.findOne({linkedAccount: IntastellarAccount});

    if(!foundAccount){
        const newLinkedAccount = await mongoose.models.User.findOneAndUpdate({_id: user?.user?._id}, {
            $push: {
                linkedAccount: IntastellarAccount
            },
        }, {upsert: true});

        if(newLinkedAccount){
            return new Response("Account Linked", {
                status: 302,
                statusText: "Redirecting...",
                headers: {
                  "Location": referrer
                }
            });
        }
    }

    if(foundAccount){
        return new Response(null, {
            status: 400,
            statusText: "Account already linked",
            headers: {
                "Location": referrer
            }
        });
    }else{
        return new Response(null, {
            status: 500,
            statusText: "Something went wrong",
            headers: {
                "Location": referrer
            }
        });
    }
}