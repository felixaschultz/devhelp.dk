import logo from "../../assets/devhelp-logo-white.svg";
import "./Style.css";
export default function Loader() {
    return (
        <div className="loader">
            <div className="loader_container">
                <div className="loader_content">
                    <img src={logo} alt="DevHelp Logo" />
                    <h2>Loading...</h2>
                </div>
            </div>
        </div>
    )
}