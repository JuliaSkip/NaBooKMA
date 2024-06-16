import MenuBar from "../MenuBar/MenuBar";
import React, { useEffect, useState } from "react";
import "./PurchasesPageStyles.css";
import ConfirmationModal from "../MenuBar/Confirm"; // Import the ConfirmationModal component


function PurchasesPage() {
    const [fetchError, setFetchError] = useState(null);
    const [checks, setChecks] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [selectedCheck, setSelectedCheck] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [sortBy, setSortBy] = useState("check_number");
    const [sortOrder, setSortOrder] = useState("ASC");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [customerFilter, setCustomerFilter] = useState("");
    const [allCustomers, setAllCustomers] = useState([]);
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [checkToDelete, setCheckToDelete] = useState(null);

    /**
     * Fetches check data from the specified endpoint and updates the state with the fetched data.
     * The function sends a GET request to `http://localhost:8081/get-checks` with query parameters
     * for sorting the data (`sortBy` and `sortOrder`). Upon a successful response, it parses the
     * JSON data and updates the state with the check data. If the request fails, it sets an error
     * message and clears the check data.
     */
    const fetchChecks = async () => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-checks?sortBy=${sortBy}&sortOrder=${sortOrder}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch checks");
            }
            const data = await response.json();
            setChecks(data);
            setFetchError(null);
        } catch (error) {
            setFetchError(error.message);
            setChecks([]);
        }
    };


    /**
     * Fetches customer data from the specified endpoint and updates the state with the fetched data.
     * The function sends a GET request to `http://localhost:8081/get-customers` with predefined query
     * parameters for sorting the data (`cust_surname` and `ASC`). Upon a successful response, it parses
     * the JSON data and updates the state with the customer data. If the request fails, it sets an error
     * message and clears the customer data.
     */
    const fetchCustomers = async () => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-customers?sortBy=${"cust_surname"}&sortOrder=${"ASC"}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch customers");
            }
            const data = await response.json();
            setAllCustomers(data);
            setFetchError(null);
        } catch (error) {
            setFetchError(error.message);
            setAllCustomers([]);
        }
    };


    /**
     * Fetches purchase data for a specific check from the specified endpoint and updates the state with the fetched data.
     * The function sends a GET request to `http://localhost:8081/get-purchases` with the check number as a query parameter.
     * Upon a successful response, it parses the JSON data and updates the state with the purchase data. If the request fails,
     * it sets an error message and clears the purchase data.
     */
    const fetchPurchases = async (check_num) => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-purchases?check_number=${check_num}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch purchases");
            }
            const data = await response.json();
            setPurchases(data);
            setFetchError(null);
        } catch (error) {
            setFetchError(error.message);
            setPurchases([]);
        }
    };

    /**
     * useEffect hook to fetch checks and customers whenever the sorting parameters change.
     * This hook calls the `fetchChecks` and `fetchCustomers` functions whenever the values of `sortBy` or `sortOrder` change.
     * It ensures that the check and customer data are always fetched and updated based on the current sorting preferences.
     */
    useEffect(() => {
        fetchChecks();
        fetchCustomers()
    }, [sortBy, sortOrder]);


    /**
     * Handles the sorting of checks based on the selected column.
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
     * Handles the search input change by updating the search query state.
     * This function is triggered on each keystroke in the search input field. It updates the
     * `searchQuery` state with the current value of the input field.
     */
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };


    /**
     * Opens a popup with the details of the selected check.
     * This function sets the `selectedCheck` state to the selected check, fetches its purchases,
     * and shows the popup by setting `showPopup` to true.
     */
    const handleOpenPopup = (check) => {
        setSelectedCheck(check);
        fetchPurchases(check.check_number);
        setShowPopup(true);
    };


    /**
     * Closes the popup and clears the selected check and purchases details.
     * This function hides the popup by setting `showPopup` to false and clears the `selectedCheck` and `purchases` state.
     */
    const handleClosePopup = () => {
        setSelectedCheck(null);
        setPurchases(null);
        setShowPopup(false);
    };


    /**
     * Handles the status change of a check.
     * This function sends a PUT request to update the status of a check. If the request is successful,
     * it fetches the updated checks. If the request fails, it sets an error message.
     */
    const handleStatusChange = async (status, check_num) => {
        try {
            const response = await fetch(`http://localhost:8081/update-status?check_number=${check_num}&status=${status.target.value}`, {
                method: 'PUT'
        });
            fetchChecks();
        } catch (error) {
            setFetchError("An error occurred while updating the status. Please try again.");
        }
    };


    const uniqueMonths = [...new Set(checks.map(check => new Date(check.print_date).getMonth() + 1))];
    const uniqueYears = [...new Set(checks.map(check => new Date(check.print_date).getFullYear()))];

    //Filters the check list based on the search query and selected filter status.
    let filteredChecks = checks ? checks.filter(check => {
        const checkDate = new Date(check.print_date);
        const matchesMonth = month ? checkDate.getMonth() + 1 === parseInt(month) : true;
        const matchesYear = year ? checkDate.getFullYear() === parseInt(year) : true;
        const matchesSearch = searchQuery.trim() === '' ? true : check.check_number.toString().trim() === searchQuery.trim();
        const matchesFilter = filter === "all" ? true : check.status === filter;
        const matchesCustomer = customerFilter.trim() === '' ? true : check.cust_surname.toLowerCase().startsWith(customerFilter.toLowerCase());

        return matchesMonth && matchesYear && matchesSearch && matchesFilter && matchesCustomer;
    }) : [];

    /**
     * Handles the filter change by updating the filter state.
     * This function updates the `filter` state with the selected filter status.
     */
    const handleFilter = (status) => {
        setFilter(status);
    };

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    const handleCustomerFilterChange = (e) => {
        setCustomerFilter(e.target.value);
    };

    /**
     * Formats a date string into a human-readable format.
     * This function takes a date string and returns it formatted as "DD/MM/YYYY, HH:MM:SS".
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(date);
    };


    /**
     * Gets the detailed information of a purchase as a formatted string.
     * This function takes a purchase object and returns a formatted string containing the purchase details.
     */
    const getPurchaseInfo = (purchase) => {
        if (!purchase) return "";
        const info = `Title: ${purchase.title}\nAuthor: ${purchase.author_name}\nPublisher: ${purchase.publisher_name}\nGenre: ${purchase.genre}\nCategory: ${purchase.category}\nPublication Date: ${formatDate(purchase.publication_date)}\nPrice at the moment: ${purchase.price} ₴\nPages: ${purchase.pages}\nLanguage: ${purchase.language}\nSummary: ${purchase.summary}\nRating: ${purchase.rating}`;
        return info;
    };


    /**
     * Handles the deletion of a check.
     * This function sends a DELETE request to delete a specific check. If the request is successful,
     * it fetches the updated checks. If the request fails, it logs an error message.
     */
    const handleDelete = (checkNumber) => {
        setCheckToDelete(checkNumber);
        setShowConfirmationModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8081/delete-check/${checkToDelete}`, {method: 'DELETE'});
            if (!response.ok) {
                throw new Error('Could not delete check');
            }
            fetchChecks();
        } catch (error) {
            console.error(error.message);
        } finally {
            setShowConfirmationModal(false);
            setCheckToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirmationModal(false);
        setCheckToDelete(null);
    };

    const totalSum = filteredChecks.reduce((sum, check) => parseFloat(sum) + parseFloat(check.total_price), 0);

    return (
        <div className="entire-page">
            <MenuBar/>
            <div className="searches">
                <input
                    type="text"
                    placeholder="Search check by number..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-bar-checks"
                />
                <input
                    type="text"
                    placeholder="Search by customer surname..."
                    value={customerFilter}
                    onChange={handleCustomerFilterChange}
                    className="search-bar-checks"
                />
            </div>
            <button className="sort-checks" onClick={() => handleSort("check_number")}>
                Sort by check number
            </button>

            <select className="sort-checks" value={filter}
                    onChange={(e) => handleFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
            </select>

            <select className="sort-checks" value={month} onChange={handleMonthChange}>
                <option value="">All months</option>
                {uniqueMonths.map((month) => (
                    <option key={month}
                            value={month}>{new Date(0, month - 1).toLocaleString('en', {month: 'long'})}</option>
                ))}
            </select>

            <select className="sort-checks" value={year} onChange={handleYearChange}>
                <option value="">All years</option>
                {uniqueYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            <div className="check page">
                <h3>Total sum: {totalSum.toFixed(2)} $</h3>
                <div className="check-cards">
                    {filteredChecks.map((check) => (
                        <div>
                            <div>
                                <select className={check.status} value={check.status}
                                        onChange={(e) => handleStatusChange(e, check.check_number)}>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="check-card" key={check.check_number}>
                                <h3>Check № {check.check_number}</h3>
                                <p className="print-date">{formatDate(check.print_date)}</p>
                                <p className="total-price">{check.total_price} $</p>
                                <button className="open-check" onClick={() => handleOpenPopup(check)}>⇲</button>
                                <button className="delete-check" onClick={() => handleDelete(check.check_number)}>⛌
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

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
                                <div className="item">
                                    <p>Address:</p>
                                    <p>{selectedCheck.city}, {selectedCheck.street}, {selectedCheck.zip_code}</p>
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
                                                    <textarea className="book-summary" value={getPurchaseInfo(purchase)}
                                                              readOnly/>
                                                </p>
                                            </div>
                                            <div className="item">
                                                <p className="amount">
                                                    {purchase.selling_price} x {purchase.quantity}
                                                </p>
                                                <p>{(purchase.selling_price * purchase.quantity).toFixed(2)} $</p>
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
                                        <h2>{selectedCheck.total_price} $</h2>
                                    </div>
                                </div>
                                <div className="zigzag-bottom"></div>
                            </div>
                        </div>
                    </div>
                )}
                {filteredChecks.length === 0 && (
                    <div className="error-message">
                        <h2>No checks found.</h2>
                    </div>
                )}
                {filteredChecks.length !== 0 && (
                    <footer className="footer">
                        <div className="contact-info">
                            <hr></hr>
                            <p>Contact us:</p>
                            <p>Email: yu.skip@ukma.edu.ua</p>
                            <p>Email: d.filozop@ukma.edu.ua</p>
                            <p>Phone: +1234567890</p>
                        </div>
                    </footer>
                )}
            </div>
            {showConfirmationModal && (
                <ConfirmationModal
                    message="Are you sure you want to delete this check?"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
}

export default PurchasesPage;
