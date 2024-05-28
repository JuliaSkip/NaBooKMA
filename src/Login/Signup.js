import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import './Signup.css';
import bcrypt from "bcryptjs";
import { createClient } from '@supabase/supabase-js';


const Signup = () => {
    const navigate = useNavigate();
    const [fetchError, setFetchError] = useState(null);
    const [formError, setFormError] = useState('');
    const [email, setEmail] = useState(null);
    const [surname, setSurname] = useState(null);
    const [name, setName] = useState(null);
    const [patronymic, setPatronymic] = useState(null);
    const [birthDate, setBirthDate] = useState(null);
    const [phone, setPhone] = useState(null);
    const [city, setCity] = useState(null);
    const [street, setStreet] = useState(null);
    const [zipCode, setZipCode] = useState(null);
    const [photo, setPhoto] = useState(null);

    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);
    const [passwordMatchError, setPasswordMatchError] = useState(false);

    const supabase = createClient('https://upkigeauanwefsngyhqb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2lnZWF1YW53ZWZzbmd5aHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjQxOTQsImV4cCI6MjAzMTgwMDE5NH0.s60GCwAeFC5zdmGKiJ0oxm7WXf2gcsCUWkUhEguUlvM');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (photo) {
            const { data, error } = await supabase.storage
                .from('customers')
                .upload(`${photo.name}`, photo, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.error('Error uploading photo:', error.message);
                setFormError('Error uploading photo. Please try again.');
                return;
            }

        }

      if (!email || !password || !surname || !name || !phone || !city || !street || !zipCode) {
            setFormError("Please fill in all the necessary fields!");
            return;
        }

        if(password !== confirmPassword || password ===''){
            setPasswordMatchError(true);
            return;
        } else {
            setPasswordMatchError(false);
        }
        let newsetedpassword = password;

        if(password === confirmPassword && password !== ''){
            newsetedpassword = await bcrypt.hash(password, 10);
        }

        try {
            const response = await fetch('http://localhost:8081/registrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_email: email,
                    password: newsetedpassword,
                    cust_surname: surname,
                    cust_name: name,
                    cust_patronymic: patronymic,
                    birth_date: birthDate,
                    phone_number: phone,
                    city: city,
                    street: street,
                    zip_code: zipCode,
                    customer_photo_url: 'https://upkigeauanwefsngyhqb.supabase.co/storage/v1/object/public/customers/'+`${photo.name}`
                }),
            });

            if (!response.ok) {
                throw new Error('An error occurred while registration. Please try again.');
            }

            navigate('/books');
        } catch (error) {
            setFormError("An error occurred while registration. Please try again.");
        }
    };


    const handleCancel = () => {
        navigate('/')
    };

    return (
        <div className="registration-form-container">
            {fetchError && (<p>{fetchError}</p>)}

            <div className="registration-form">
                {formError && <p className="add-error-message">{formError}</p>}
                <h2 className="nabookma-form">NaBooKMA</h2>
                <form onSubmit={handleSubmit}>

                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="surname">Surname:</label>
                    <input
                        type="text"
                        id="surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />

                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label htmlFor="patronymic">Patronymic:</label>
                    <input
                        type="text"
                        id="patronymic"
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                    />

                    <label htmlFor="birthDate">Birth date:</label>
                    <input
                        type="date"
                        id="birthDate"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                    />

                    <label htmlFor="phone">Phone number:</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <label htmlFor="city">City:</label>
                    <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />

                    <label htmlFor="street">Street:</label>
                    <input
                        type="text"
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                    />

                    <label htmlFor="zipCode">Zip code:</label>
                    <input
                        type="text"
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                    />

                    <label htmlFor="photo">Profile image:</label>
                    <input
                        type="file"
                        id="photo"
                        onChange={(e) => setPhoto(e.target.files[0])}
                    />

                    {passwordMatchError && <p className='add-error-message'>Passwords do not match</p>}
                    <label htmlFor="password">Password:</label>
                    <input type="password"
                           id="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           style={{borderColor: passwordMatchError ? 'red' : ''}}
                    />
                    <label htmlFor="password">Confirm password:</label>
                    <input type="password"
                           id="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           style={{borderColor: passwordMatchError ? 'red' : ''}}
                    />
                    <div className="action-buttons">
                        <button type="button" onClick={handleCancel}>Cancel</button>
                        <button type="submit">Sign up</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;