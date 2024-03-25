import mongoose from "mongoose";
export async function Recommendation({user}){
    const recommendation = await mongoose.model("LookedAtLast").findOne({user: user._id});

    const tags = recommendation.tags;
    const posts = await mongoose.model("BlogPost").find({tags: { $in: tags }}).limit(10);

    return posts;
}