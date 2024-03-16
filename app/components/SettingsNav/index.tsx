import {NavLink} from "@remix-run/react";
import "./Style.css";

export default function SettingsNav({userSettings}){
    return (
        <nav className="settings-nav">
            {
                userSettings?.role === "pro" && (
                    <NavLink style={(isActive) => {
                        if(isActive){
                            return {
                                color: "red"
                            }
                        }
                    }} to={`/settings/pro`}>Pro settings</NavLink>
                )
            }
            <NavLink style={(isActive) => {
                if(isActive){
                    return {
                        color: "red"
                    }
                }
            }} to={`/settings/account`}>Account settings</NavLink>
        </nav>
    )
}