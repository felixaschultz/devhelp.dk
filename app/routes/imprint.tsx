export const loader = async ({request, params}) => {
    return {
        title: "Impressum"
    };
}

export const meta = ({data}) => {
    return [
        {
            title: "Impressum | Devhelp.dk",
            description: "Impressum content"
        },
        {
            name: "og:title",
            content: "Impressum"
        },
        {
            name: "og:description",
            content: "Impressum content"
        }
    ]
};

export default function TermsOfService(){
    return (
        <div className="content">
            <h1>Impressum</h1>
        </div>
    );
}