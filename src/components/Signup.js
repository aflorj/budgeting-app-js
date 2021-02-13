import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Alert from "./Alert";
import { Link, useHistory } from "react-router-dom";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Passwords do not match");
        }

        try {
            setError('');
            setLoading(true);
            await signup(emailRef.current.value, passwordRef.current.value);
            history.push("/login")
        } catch {
            setError("Failed to create an account");
        }
        setLoading(false)
    }

    return (
        <>
            <div>
                Sign Up
                {error && <Alert error={error} />}
                <form onSubmit={handleSubmit}>
                    email:
                    <input type="email" ref={emailRef} required></input>
                    password:
                    <input type="password" ref={passwordRef} required></input>
                    password confirmation:
                    <input type="password" ref={passwordConfirmRef} required></input>
                    <button disabled={loading} type="submit">Sign Up</button>
                </form>
            </div>
            <div>
                Already have an account? <Link to="/login">Login</Link>
            </div>
        </>
    )
}
