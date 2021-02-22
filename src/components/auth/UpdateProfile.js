import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from './ErrorAlert';
import { Link, useHistory } from 'react-router-dom';

export default function UpdateProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, updatePassword, updateEmail } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    const promises = [];
    setLoading(true);
    setError('');
    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value));
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value));
    }

    Promise.all(promises)
      .then(() => {
        history.push('/');
      })
      .catch(() => {
        setError('Failed to update the account');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <div>
        Update Profile
        {error && <ErrorAlert error={error} />}
        <form onSubmit={handleSubmit}>
          email:
          <input
            type="email"
            ref={emailRef}
            required
            defaultValue={currentUser.email}
          ></input>
          password:
          <input
            type="password"
            ref={passwordRef}
            placeholder="Leave empty to keep the same password"
          ></input>
          password confirmation:
          <input
            type="password"
            ref={passwordConfirmRef}
            placeholder="Leave empty to keep the same password"
          ></input>
          <button disabled={loading} type="submit">
            Update
          </button>
        </form>
      </div>
      <div>
        <Link to="/">Cancel</Link>
      </div>
    </>
  );
}
