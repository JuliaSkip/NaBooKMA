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


    /**
     * Fetches customer data from the specified endpoint and updates the state with the fetched data.
     * The function sends a GET request to `http://localhost:8081/get-customers` with query parameters
     * for sorting the data (`sortBy` and `sortOrder`). Upon a successful response, it parses the
     * JSON data and updates the state with the customer data. If the request fails, it sets an error
     * message and clears the customer data.
     */
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


    /**
     * useEffect hook to fetch customer data whenever the sorting parameters change.
     * This hook calls the `fetchCustomers` function whenever the values of `sortBy` or `sortOrder` change.
     * It ensures that the customer data is always fetched and updated based on the current sorting preferences.
     */
    useEffect(() => {
        fetchCustomers();
    }, [sortBy, sortOrder]);


    /**
     * Handles the search input change by updating the search query state.
     * This function is triggered on each keystroke in the search input field. It updates the
     * `searchQuery` state with the current value of the input field.
     */
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };


    /**
     * Filters the customer list based on the search query and excludes "admin" from the results.
     * This constant filters the `customers` array to include only those whose `cust_surname`
     * starts with the `searchQuery` and is not "admin".
     */
    const filteredCustomers = customers.filter(customer =>
        customer.cust_surname.toLowerCase().startsWith(searchQuery.toLowerCase()) &&
        customer.cust_surname.toLowerCase() !== "admin"
    );


    /**
     * Handles the sorting of customers based on the selected column.
     * This function updates the sorting state (`sortBy` and `sortOrder`) when a column header is clicked.
     * If the column is already the one being sorted, it toggles the sort order. Otherwise, it sets
     * the sort column to the selected column and the sort order to ascending.
     */
    const handleSort = (columnName) => {
        if (sortBy === columnName) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(columnName);
            setSortOrder("ASC");
        }
    };


    /**
     * Opens a popup with the details of the selected customer.
     * This function sets the `popupCustomer` state to the selected customer and shows the popup
     * by setting `showPopup` to true.
     */
    const handlePopup = (customer) => {
        setPopupCustomer(customer);
        setShowPopup(true);
    };


    /**
     * Closes the popup and clears the selected customer details.
     * This function hides the popup by setting `showPopup` to false and clears the `popupCustomer` state.
     */
    const handleClosePopup = () => {
        setShowPopup(false);
        setPopupCustomer(null);
    };


    /**
     * Formats a date string into a human-readable format.
     * This function takes a date string and returns it formatted as "Month Day, Year".
     */
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };


    return (
        <div className="entire-page">
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
                        <div className="popup-cust">
                            <div className="popup-content-cust">
                                <span className="close" onClick={handleClosePopup}>&times;</span>
                                {popupCustomer.customer_photo_url && (
                                    <img
                                        src={popupCustomer.customer_photo_url}
                                        alt="Customer"
                                        className="customer-photo-popup"
                                    />
                                )}
                                <h2>{popupCustomer.cust_name} {popupCustomer.cust_surname} {popupCustomer.patronymic}</h2>
                                <p>Birth date: {formatDate(popupCustomer.birth_date)}</p>
                                <p>Email: {popupCustomer.customer_email}</p>
                                <p>Phone: {popupCustomer.phone_number}</p>
                                <p>Address: {popupCustomer.city} {popupCustomer.street} {popupCustomer.zip_code}</p>
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
