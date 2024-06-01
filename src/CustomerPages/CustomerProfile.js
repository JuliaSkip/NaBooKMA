import React, { useEffect, useState } from "react";
import MenuBar from "../MenuBar/MenuBar";
import "./CustomerProfileStyles.css"

function CustomerProfile() {
    const [profile, setProfile] = useState([]);
    const [checks, setChecks] = useState([]);
    const [currentCheckIndex, setCurrentCheckIndex] = useState(0);
    const [purchases, setPurchases] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState(null);




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
                `http://localhost:8081/get-purchases?check_number=${currentCheckIndex}`
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

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            fetchCustomer(storedEmail);
            fetchOrders(storedEmail)
        }
        console.log(checks)
    }, []);


    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("EN-us", options);
    };
    const handleOpenPopup = (check) => {
        setSelectedCheck(check);
        fetchPurchases();
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setSelectedCheck(null);
        setPurchases([]);
        setShowPopup(false);
    };

    const handleNextCheck = () => {
        setCurrentCheckIndex((prevIndex) => (prevIndex + 1) % checks.length); // Increment index, looping back to 0 when reaching the end
    };

    const handlePreviousCheck = () => {
        setCurrentCheckIndex((prevIndex) => (prevIndex - 1 + checks.length) % checks.length); // Decrement index, looping back to checks.length - 1 when reaching the beginning
    };


    return (
        <div>
            <MenuBar />
            <div className="dashboard">
                    {profile ? (
                        <>
                            <div className="main-info">
                                <img src={profile.customer_photo_url} alt="Customer Photo" className="profile-photo"/>
                                <div className="profile-info">
                                    <h2>{profile.cust_name} {profile.cust_patronymic} {profile.cust_surname}</h2>
                                    <p>Email: {profile.customer_email}</p>
                                    <hr></hr>
                                    <p>Phone number: +{profile.phone_number}</p>
                                    <hr></hr>
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
                                            <div>
                                                <button onClick={handlePreviousCheck} disabled={currentCheckIndex === 0}>⇦</button>
                                                <button onClick={handleNextCheck} disabled={currentCheckIndex === checks.length - 1}>⇨</button>
                                            </div>
                                            <div className="check-card-profile" key={checks[currentCheckIndex].check_number}>
                                                <h3>Order № {currentCheckIndex + 1}</h3>
                                                <p>Order date: {formatDate(checks[currentCheckIndex].print_date)}</p>
                                                <p>Total price: {checks[currentCheckIndex].total_price} $</p>
                                                <button onClick={handleOpenPopup}>Show check</button>
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
                                                    <span className="close" onClick={handleClosePopup}>
                                    &times;
                                </span>
                                                    <div className="header">
                                                        <h2>NaBooKMA</h2>
                                                        <p>
                                                            Address: Olexandra Exter, 14B
                                                            <br/>
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
                        <p>No profile data available.</p>
                    )}
            </div>
        </div>
    );
}

export default CustomerProfile;
