import {NavLink} from "@remix-run/react";
import "./Style.css";

export default function SettingsNav({userSettings}){
    return (
        <nav className="settings-nav">
            <NavLink style={({ isActive }) => ({
                        color: isActive
                            ? "rgb(192, 159, 83)"
                            : "",
                    })} to={`/settings/account`}>Account settings</NavLink>
            <NavLink style={({ isActive }) => ({
                        color: isActive
                            ? "rgb(192, 159, 83)"
                            : "",
                    })} to="/settings/security">Security</NavLink>
            <NavLink style={({ isActive }) => ({
                        color: isActive
                            ? "rgb(192, 159, 83)"
                            : "",
                    })} to="/settings/notifications">Notifications</NavLink>
            {
                userSettings?.role === "pro" && (
                    <NavLink style={({ isActive }) => ({
                        color: isActive
                            ? "rgb(192, 159, 83)"
                            : "",
                    })} to={`/settings/pro`}>Pro settings</NavLink>
                    )
            }
            <NavLink style={({ isActive }) => ({
                        color: isActive
                            ? "#fff"
                            : "",
                    })} to="/settings/privacy">Privacy</NavLink>
            <NavLink style={({ isActive }) => ({
                        color: isActive
                            ? "#fff"
                            : "",
                    })} to="/settings/billing">Billing</NavLink>
        </nav>
    )
}