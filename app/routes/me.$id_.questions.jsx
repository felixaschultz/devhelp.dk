import { authenticator } from "../services/auth.server";

export const loader = async ({request}) => {
    const user = await authenticator.isAuthenticated(request, {
        redirectTo: "/login"
    });

    return {user};
};

export default function QuestionsToMe(){
    return (
        <div className="content">
            <h1>Questions to me</h1>
        </div>
    );
}