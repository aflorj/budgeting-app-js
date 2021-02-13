import React from 'react';
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const history = useHistory();

    async function handleLogout() {
        await logout();
        history.push("/login")
    }
    
    return (
        <>
            <div>
                Email: {currentUser.email}
            </div>
            <div>
                <Link to="/profile">Update Profile</Link>
            </div>
            <button onClick={handleLogout}>Log Out</button>
        </>
    )
}
