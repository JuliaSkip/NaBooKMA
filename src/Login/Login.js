import React, { useState, useEffect } from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import './LoginStyles.css';
import bcrypt from "bcryptjs";

function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [DbPassword, setDbPassword] = useState(null);

    /**
     * useEffect hook to fetch user data when the email changes.
     */
    useEffect(() => {
        if (email) {
            fetchUser();
        }
    }, [email]);

    /**
     * Fetches user data from the server based on the provided email.
     * This function sends a GET request to `http://localhost:8081/get-customer-by-email` with the email
     * as a query parameter. Upon a successful response, it extracts the user data and updates the state
     * with the user's password. It also stores the user's email and ID in the local storage.
     */
    const fetchUser = async () => {
        try {
            const response = await fetch(`http://localhost:8081/get-customer-by-email?email=${email}`);
            if (!response.ok) {
                throw new Error('User not found');
            }

            const userData = await response.json();
            if (userData.length === 0) {
                throw new Error('User not found');
            }

            setDbPassword(userData[0].password);
            localStorage.setItem('email', userData[0].customer_email)
            localStorage.setItem('id', userData[0].customer_id)

        } catch (error) {
        }
    };


    /**
     * Handles form submission by validating user input and navigating to the specified route.
     * This function is triggered on form submission. It checks if the email is provided and compares
     * the entered password with the stored password. If the credentials match, it navigates to the
     * '/nabookma' route; otherwise, it sets an error message.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!email) {
                throw new Error('Please enter your email');
            }

            const passwordMatch = await bcrypt.compare(password, DbPassword);

            if (!passwordMatch) {
                throw new Error('Incorrect password or email!');
            }

            navigate('/nabookma');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="main">
            <div className="full-form">
                <form onSubmit={handleSubmit}>
                    <div className="line">
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    <div className="line">
                        <label htmlFor="email" className="line-heading">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your email"
                            name="id"
                            className="input-field-login"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="line">
                        <label htmlFor="password" className="line-heading">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            className="input-field-login"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Log in
                    </button>
                    <NavLink to="/signup" className="sign-up-button" activeClassName="active">Sign up</NavLink>
                </form>
            </div>
        </div>
    );
}

export default Login;