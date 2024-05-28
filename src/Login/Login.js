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

    useEffect(() => {
        if (email) {
            fetchUser();
        }
    }, [email]);

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

        } catch (error) {
        }
    };

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

            navigate('/customers');
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
                            <strong>ID</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your ID"
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