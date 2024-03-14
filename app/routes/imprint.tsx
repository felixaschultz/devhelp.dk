export const loader = async ({request, params}) => {
    return {
        title: "Impressum"
    };
}

export default function TermsOfService(){
    return (
        <div className="content">
            <h1>Impressum</h1>
        </div>
    );
}