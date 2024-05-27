import React, { useEffect, useState } from "react";
import MenuBar from "../MenuBar/MenuBar";
import "./CustomersPageStyles.css";

function CustomerPage() {
    const [fetchError, setFetchError] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupCustomer, setPopupCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("cust_surname");
    const [sortOrder, setSortOrder] = useState("ASC");

    const fetchCustomers = async () => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-customers?sortBy=${sortBy}&sortOrder=${sortOrder}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch customers");
            }
            const data = await response.json();
            setCustomers(data);
            setFetchError(null);
        } catch (error) {
            setFetchError(error.message);
            setCustomers([]);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [sortBy, sortOrder]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.cust_surname.toLowerCase().startsWith(searchQuery.toLowerCase()) &&
        customer.cust_surname.toLowerCase() !== "admin"
    );

    const handleSort = (columnName) => {
        if (sortBy === columnName) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(columnName);
            setSortOrder("ASC");
        }
    };

    const handlePopup = (customer) => {
        setPopupCustomer(customer);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setPopupCustomer(null);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    return (
        <div>
            <MenuBar />
            <div>
                <input
                    type="text"
                    placeholder="Search by surname..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-bar-customers"
                />
                <button
                    className="sort-customers"
                    onClick={() => handleSort("cust_surname")}
                >
                    Sort by surname
                </button>
            </div>
            <div className="customer-cards">
                {filteredCustomers.map((customer) => (
                    <div
                        key={customer.customer_id}
                        className="customer-card"
                        onClick={() => handlePopup(customer)}
                    >
                        {customer.customer_photo_url && (
                            <img
                                src={customer.customer_photo_url}
                                alt="Customer"
                                className="customer-photo"
                            />
                        )}
                        <div className="customer-info">
                            <h2>{customer.cust_name} {customer.cust_surname}</h2>
                            <p>Email: {customer.customer_email}</p>
                            <p>Phone: {customer.phone_number}</p>
                        </div>
                    </div>
                ))}
            </div>
            {popupCustomer && showPopup && (
                <>
                    <div className="overlay" onClick={handleClosePopup}></div>
                    <div className="popup-container-cust">
                        <div className="popup">
                            <div className="popup-content-cust">
                                <span className="close" onClick={handleClosePopup}>&times;</span>
                                {popupCustomer.customer_photo_url && (
                                    <img
                                        src={popupCustomer.customer_photo_url}
                                        alt="Customer"
                                        className="customer-photo"
                                    />
                                )}
                                <h2>{popupCustomer.cust_name} {popupCustomer.cust_surname} {popupCustomer.patronymic}</h2>
                                <p>Birth date: {formatDate(popupCustomer.birth_date)}</p>
                                <p>Email: {popupCustomer.customer_email}</p>
                                <p>Phone: {popupCustomer.phone_number}</p>
                                <p>Address: {popupCustomer.city} {popupCustomer.street}, {popupCustomer.zip_code}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {fetchError && <div>Error: {fetchError}</div>}
            {filteredCustomers.length === 0 && <div className="error-message"><h2>No customers found.</h2></div>}
            {filteredCustomers.length !== 0 &&
                <footer className="footer">
                    <div className="contact-info">
                        <hr></hr>
                        <p>Contact us:</p>
                        <p>Email: yu.skip@ukma.edu.ua</p>
                        <p>Email: d.filozop@ukma.edu.ua</p>
                        <p>Phone: +1234567890</p>
                    </div>
                </footer>}
        </div>
    );
}

export default CustomerPage;
