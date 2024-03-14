export const loader = async ({request, params}) => {
    return {
        title: "Terms of Service"
    };
}

export const meta = ({data}) => {
    return [
        {
            title: "Terms of Service | Devhelp.dk",
            description: "Terms of Service content"
        },
        {
            name: "og:title",
            content: "Terms of Service"
        },
        {
            name: "og:description",
            content: "Terms of Service content"
        }
    ]
};

export default function TermsOfService(){
    return (
        <div className="content">
            <h1>Terms of Service</h1>
            <p>Terms of Service content</p>
        </div>
    );
}