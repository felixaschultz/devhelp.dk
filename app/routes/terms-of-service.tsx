export const loader = async ({request, params}) => {
    return {
        title: "Terms of Service"
    };
}

export default function TermsOfService(){
    return (
        <div className="content">
            <h1>Terms of Service</h1>
            <p>Terms of Service content</p>
        </div>
    );
}