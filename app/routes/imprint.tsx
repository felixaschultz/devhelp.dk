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

            <p>
                Intastellar Solutions, International <br />
                Risdalsvej 36, st 13. <br />
                8260 Viby J <br />
                Denmark <br />
                CVR: 41604409
            </p>
            <p>
                Email: info@devhelp.dk <br />
                Web: www.devhelp.dk
            </p>
            <p>
                Personal adherent society: Intastellar Solutions, International <br />
                Authorized representer: Felix Adrian Schultz <br />
            </p>
            <p>Country: Denmark</p>
        </div>
    );
}