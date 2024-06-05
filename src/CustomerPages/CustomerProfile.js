import React, { useEffect, useState } from "react";
import MenuBar from "../MenuBar/MenuBar";
import "./CustomerProfileStyles.css";
import bcrypt from "bcryptjs";
import {createClient} from "@supabase/supabase-js";

function CustomerProfile() {
    const [profile, setProfile] = useState([]);
    const [checks, setChecks] = useState([]);
    const [currentCheckIndex, setCurrentCheckIndex] = useState(0);
    const [purchases, setPurchases] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showProfileEditPopup, setShowProfileEditPopup] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [email, setEmail] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [photo, setPhoto] = useState(null);
    const [basket, setBasket] = useState([]);

    const [updatedProfile, setUpdatedProfile] = useState({
        cust_name: '',
        cust_patronymic: '',
        cust_surname: '',
        phone_number: '',
        city: '',
        street: '',
        zip_code: ''
    });

    const fetchCustomer = async (cust) => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-profile?customer_email=${cust}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch customer");
            }
            const data = await response.json();
            setProfile(data[0]);
        } catch (error) {
            setProfile([]);
        }
    };

    const fetchOrders = async (cust) => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-checks-by-customer?sortBy=${"check_number"}&sortOrder=${"ASC"}&customer_email=${cust}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch customer");
            }
            const data = await response.json();
            setChecks(data);
        } catch (error) {
            setChecks([]);
        }
    };

    const fetchPurchases = async () => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-purchases?check_number=${checks[currentCheckIndex].check_number}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch purchases");
            }
            const data = await response.json();
            setPurchases(data);
        } catch (error) {
            setPurchases([]);
        }
    };

    const fetchBasket = async (email) => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-basket?customer_email=${email}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch basket");
            }
            const data = await response.json();
            setBasket(data);
        } catch (error) {
            setBasket([]);
        }
    };
    useEffect(() => {
        fetchBasket(email);
    }, [basket]);

    const getPurchaseInfo = (purchase) => {
        if (!purchase) return "";
        const info = `Title: ${purchase.title}\nAuthor: ${purchase.author_name}\nPublisher: ${purchase.publisher_name}\nGenre: ${purchase.genre}\nCategory: ${purchase.category}\nPublication Date: ${formatDate(purchase.publication_date)}\nPrice at the moment: ${purchase.price} ₴\nPages: ${purchase.pages}\nLanguage: ${purchase.language}\nSummary: ${purchase.summary}\nRating: ${purchase.rating}`;
        return info;
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            fetchCustomer(storedEmail);
            fetchOrders(storedEmail)
            setEmail(storedEmail)
        }
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("EN-us", options);
    };

    const handleOpenPopup = () => {
        setSelectedCheck(checks[currentCheckIndex]);
        fetchPurchases();
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setSelectedCheck(null);
        setPurchases([]);
        setShowPopup(false);
    };

    const handleNextCheck = () => {
        setCurrentCheckIndex((prevIndex) => (prevIndex + 1) % checks.length);
    };

    const handlePreviousCheck = () => {
        setCurrentCheckIndex((prevIndex) => (prevIndex - 1 + checks.length) % checks.length);
    };

    function getStatusColor(status) {
        switch (status) {
            case 'pending':
                return 'rgb(246,144,144)';
            case 'processing':
                return 'rgb(246,236,144)';
            case 'completed':
                return 'rgb(170,246,144)';
            default:
                return 'black';
        }
    }

    const handleDelete = async (checkNumber) => {
        try {
            const response = await fetch(`http://localhost:8081/delete-check/${checkNumber}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Could not delete check');
            }
            fetchOrders(email);
            setCurrentCheckIndex(currentCheckIndex-1)
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        console.log(currentPassword)
        console.log(newPassword)
        if (newPassword !== confirmPassword) {
            window.alert('New passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            window.alert('New password must be at least 6 characters long.');
            return;
        }

        const passwordMatch = await bcrypt.compare(currentPassword, profile.password);

        if (!passwordMatch) {
            window.alert('Current password is incorrect.');
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        try {
            const response = await fetch(`http://localhost:8081/change-password?password=${hashedPassword}&customer_email=${email}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Failed to change password');
            }

            setShowPasswordPopup(false)

        } catch (error) {
            window.alert('Failed to change password. Please try again.');
            console.error(error.message);
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleOpenPasswordPopup = () => {
        setShowPasswordPopup(true);
    };

    const handleClosePasswordPopup = () => {
        setShowPasswordPopup(false);
    };

    const handleOpenProfileEditPopup = () => {
        setUpdatedProfile({
            cust_name: profile.cust_name,
            cust_patronymic: profile.cust_patronymic,
            cust_surname: profile.cust_surname,
            phone_number: profile.phone_number,
            city: profile.city,
            street: profile.street,
            zip_code: profile.zip_code
        });
        setShowProfileEditPopup(true);
    };

    const handleCloseProfileEditPopup = () => {
        setShowProfileEditPopup(false);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUpdatedProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value
        }));
    };


    const supabase = createClient('https://upkigeauanwefsngyhqb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2lnZWF1YW53ZWZzbmd5aHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjQxOTQsImV4cCI6MjAzMTgwMDE5NH0.s60GCwAeFC5zdmGKiJ0oxm7WXf2gcsCUWkUhEguUlvM');


    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            let photoUrl = profile.customer_photo_url;

            if (photo) {
                const { data, error } = await supabase.storage
                    .from('customers')
                    .upload(`public/${photo.name}`, photo, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (error) {
                    console.error('Error uploading photo:', error.message);
                    return;
                }

                photoUrl = `https://upkigeauanwefsngyhqb.supabase.co/storage/v1/object/public/customers/${photo.name}`;
            }

            const profileToSubmit = {
                ...updatedProfile,
                customer_photo_url: photoUrl,
                customer_email: email,
            };

            const response = await fetch(`http://localhost:8081/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileToSubmit),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setShowProfileEditPopup(false);
            fetchCustomer(email);
        } catch (error) {
            window.alert('Failed to update profile. Please try again.');
            console.error(error.message);
        }
    };


    return (
        <div className="entire-page">
            <MenuBar length_b={basket.length}/>
            <div className="dashboard">
                {email !== "admin@ukma.edu.ua" ? (
                    <>
                        <div className="main-info">
                            <img src={profile.customer_photo_url} alt="Customer Photo" className="profile-photo" />
                            <div className="profile-info">
                                <h2>{profile.cust_name} {profile.cust_patronymic} {profile.cust_surname}</h2>
                                <p>Email: {profile.customer_email}</p>
                                <hr />
                                <p>Phone number: {profile.phone_number}</p>
                                <hr />
                                <div className="action">
                                <button onClick={handleOpenProfileEditPopup}>Edit Profile</button>
                                <button onClick={handleOpenPasswordPopup}>Change Password</button>
                                </div>
                            </div>
                        </div>

                        <div className="right-column">
                            <div className="delivery-info">
                                <h3>Contact information</h3>
                                <p><strong>Birth Date:</strong> {formatDate(profile.birth_date)}</p>
                                <p><strong>City:</strong> {profile.city}</p>
                                <p><strong>Street:</strong> {profile.street}</p>
                                <p><strong>ZIP Code:</strong> {profile.zip_code}</p>
                            </div>

                            <div className="delivery-info">
                                {checks.length !== 0 ? (
                                    <>
                                        <button className="back" onClick={handlePreviousCheck}
                                                style={{ visibility: checks.length === 1 ? 'hidden' : 'visible' }}>⇦
                                        </button>
                                        <button className="next" onClick={handleNextCheck}
                                                style={{ visibility: checks.length === 1 ? 'hidden' : 'visible' }}>⇨
                                        </button>

                                        <div className="check-card-profile"
                                             key={checks[currentCheckIndex].check_number}>
                                            {checks[currentCheckIndex].status === "pending" && (
                                                <button className="delete-order"
                                                        onClick={() => handleDelete(checks[currentCheckIndex].check_number)}>Cancel
                                                    order</button>
                                            )}
                                            <h3>Order № {currentCheckIndex + 1}</h3>
                                            <p>Order date: {formatDate(checks[currentCheckIndex].print_date)}</p>
                                            <p>Total price: {checks[currentCheckIndex].total_price} ₴</p>
                                            <p style={{ background: getStatusColor(checks[currentCheckIndex].status) }}
                                               className="status">{checks[currentCheckIndex].status}</p>
                                            <button className="show-button" onClick={handleOpenPopup}>Show check</button>
                                        </div>

                                    </>
                                ) : (
                                    <p>No purchases</p>
                                )}
                                {showPopup && purchases && (
                                    <div className="overlay">
                                        <div className="total-check">
                                            <div className="receipt">
                                                <div className="zigzag-top"></div>
                                                <span className="close" onClick={handleClosePopup}>&times;</span>
                                                <div className="header">
                                                    <h2>NaBooKMA</h2>
                                                    <p>Address: Olexandra Exter, 14B
                                                        <br />
                                                        Tel: +380987654321
                                                    </p>
                                                </div>
                                                <div className="item">
                                                    <p>Check №:</p>
                                                    <p>{selectedCheck.check_number}</p>
                                                </div>
                                                <div className="item">
                                                    <p>Status:</p>
                                                    <p>{selectedCheck.status}</p>
                                                </div>
                                                <div className="item">
                                                    <p>Customer:</p>
                                                    <p>
                                                        {selectedCheck.cust_name} {selectedCheck.cust_surname}
                                                    </p>
                                                </div>
                                                <div className="item">
                                                    <p>Email:</p>
                                                    <p>{selectedCheck.customer_email}</p>
                                                </div>
                                                <h3 className="delimiter">
                                                    *****************************************
                                                </h3>
                                                <div className="items">
                                                    {purchases.map((purchase) => (
                                                        <div key={purchase.id}>
                                                            <div className="item book-container">
                                                                <p className="book-name">
                                                                    {purchase.title}, {purchase.author_name}.{" "}
                                                                    {purchase.publisher_name}
                                                                    {purchase.book_photo_url && (
                                                                        <img
                                                                            src={purchase.book_photo_url}
                                                                            alt={purchase.title}
                                                                            className="book-image"
                                                                        />
                                                                    )}
                                                                    <textarea className="book-summary"
                                                                              value={getPurchaseInfo(purchase)}
                                                                              readOnly />
                                                                </p>
                                                            </div>
                                                            <div className="item">
                                                                <p className="amount">
                                                                    {purchase.selling_price} x {purchase.quantity}
                                                                </p>
                                                                <p>{(purchase.selling_price * purchase.quantity).toFixed(2)} ₴</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <h3 className="delimiter">
                                                    *****************************************
                                                </h3>
                                                <div className="payment-details">
                                                    <div className="item">
                                                        <h2>Total:</h2>
                                                        <h2>{selectedCheck.total_price} ₴</h2>
                                                    </div>
                                                </div>
                                                <div className="zigzag-bottom"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </>
                ) : (
                    <div className="main-info-admin" style={{ marginLeft: "85%" }}>
                        <img src={profile.customer_photo_url} alt="Customer Photo" className="profile-photo" />
                        <div className="profile-info">
                            <h2>{profile.cust_name} {profile.cust_patronymic} {profile.cust_surname}</h2>
                            <p>Email: {profile.customer_email}</p>
                            <hr/>
                            <button onClick={handleOpenPasswordPopup}>Change Password</button>
                        </div>
                    </div>
                )}
                {showPasswordPopup && (
                    <div className="overlay">
                        <div className="change-password-popup">
                            <h3>Change Password</h3>
                            <form onSubmit={handleChangePassword}>
                                <label htmlFor="current-password">Current password:</label>
                                <input
                                    type="password"
                                    id="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="new-password">New password:</label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="confirm-password">Confirm new password:</label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                {error && <p className="error">{error}</p>}
                                <button type="submit">Change Password</button>
                                <button type="button" onClick={handleClosePasswordPopup}>Cancel</button>
                            </form>
                        </div>
                    </div>
                )}
                {showProfileEditPopup && (
                    <div className="overlay">
                        <div className="change-password-popup">
                            <h3>Edit Profile</h3>
                            <form onSubmit={handleProfileUpdate}>
                                <label htmlFor="cust_name">First Name:</label>
                                <input
                                    type="text"
                                    id="cust_name"
                                    name="cust_name"
                                    value={updatedProfile.cust_name}
                                    onChange={handleProfileChange}
                                    required
                                />
                                <label htmlFor="cust_patronymic">Patronymic:</label>
                                <input
                                    type="text"
                                    id="cust_patronymic"
                                    name="cust_patronymic"
                                    value={updatedProfile.cust_patronymic}
                                    onChange={handleProfileChange}
                                    required
                                />
                                <label htmlFor="cust_surname">Last Name:</label>
                                <input
                                    type="text"
                                    id="cust_surname"
                                    name="cust_surname"
                                    value={updatedProfile.cust_surname}
                                    onChange={handleProfileChange}
                                    required
                                />
                                <label htmlFor="phone_number">Phone Number:</label>
                                <input
                                    type="text"
                                    id="phone_number"
                                    name="phone_number"
                                    value={updatedProfile.phone_number}
                                    onChange={handleProfileChange}
                                    required
                                />
                                <label htmlFor="city">City:</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={updatedProfile.city}
                                    onChange={handleProfileChange}
                                    required
                                />
                                <label htmlFor="street">Street:</label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={updatedProfile.street}
                                    onChange={handleProfileChange}
                                    required
                                />
                                <label htmlFor="zip_code">ZIP Code:</label>
                                <input
                                    type="text"
                                    id="zip_code"
                                    name="zip_code"
                                    value={updatedProfile.zip_code}
                                    onChange={handleProfileChange}
                                    required
                                />
                                <label htmlFor="photo">Profile image:</label>
                                <input
                                    type="file"
                                    id="photo"
                                    onChange={(e) => setPhoto(e.target.files[0])}
                                />
                                {error && <p className="error">{error}</p>}
                                <button type="button" onClick={handleCloseProfileEditPopup}>Cancel</button>
                                <button type="submit">Save Changes</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerProfile;
