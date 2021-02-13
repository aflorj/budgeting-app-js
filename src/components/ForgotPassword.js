import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Alert from "./Alert";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const emailRef = useRef();
    const { resetPassword } = useAuth();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage('')
            setError('');
            setLoading(true);
            await resetPassword(emailRef.current.value);
            setMessage("Check your inbox")
        } catch {
            setError("Failed to reset password");
        }
        setLoading(false)
    }

    return (
        <>
            <div>
                Password Reset
                {error && <Alert error={error} />}
                {message && <Alert error={message} />}
                <form onSubmit={handleSubmit}>
                    email:
                    <input type="email" ref={emailRef} required></input>
                    password:
                    <button disabled={loading} type="submit">Reset Password</button>
                </form>
            </div>
            <div>
                <Link to="/login">Login</Link>
            </div>
            <div>
                Need an account? <Link to="/signup">Sign up</Link>
            </div>
        </>
    )
}
