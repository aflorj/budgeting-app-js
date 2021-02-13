import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Alert from "./Alert";
import { Link, useHistory } from "react-router-dom";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            history.push("/");
        } catch {
            setError("Failed to log in");
        }
        setLoading(false)
    }

    return (
        <>
            <div>
                Login
                {error && <Alert error={error} />}
                <form onSubmit={handleSubmit}>
                    email:
                    <input type="email" ref={emailRef} required></input>
                    password:
                    <input type="password" ref={passwordRef} required></input>
                    <button disabled={loading} type="submit">Login</button>
                </form>
            </div>
            <div>
                <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <div>
                Need an account? <Link to="/signup">Sign up</Link>
            </div>
        </>
    )
}
