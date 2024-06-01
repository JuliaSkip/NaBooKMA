import MenuBar from "../MenuBar/MenuBar";
import React, { useEffect, useState } from "react";
import "./PurchasesPageStyles.css";

function PurchasesPage() {
    const [fetchError, setFetchError] = useState(null);
    const [checks, setChecks] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [selectedCheck, setSelectedCheck] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [sortBy, setSortBy] = useState("check_number");
    const [sortOrder, setSortOrder] = useState("ASC");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // State for filter


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

    useEffect(() => {
        fetchChecks();
    }, [sortBy, sortOrder]);

    const handleSort = (columnName) => {
        if (sortBy === columnName) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(columnName);
            setSortOrder("ASC");
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleOpenPopup = (check) => {
        setSelectedCheck(check);
        fetchPurchases(check.check_number);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setSelectedCheck(null);
        setPurchases(null);
        setShowPopup(false);
    };

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

    let filteredChecks;
    if(filter === "all") {
        filteredChecks = checks ? (searchQuery.trim() === '' ? checks : checks.filter(check =>
            check.check_number.toString().trim() === searchQuery.trim()
        )) : [];
    }else{
        filteredChecks = checks ? (searchQuery.trim() === '' ? checks.filter(check =>
            check.status === filter) : checks.filter(check =>
            check.check_number.toString().trim() === searchQuery.trim() && check.status === filter
        )) : [];
    }


    const handleFilter = (status) => {
        setFilter(status);
    };

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

    const getPurchaseInfo = (purchase) => {
        if (!purchase) return "";
        const info = `Title: ${purchase.title}\nAuthor: ${purchase.author_name}\nPublisher: ${purchase.publisher_name}\nGenre: ${purchase.genre}\nCategory: ${purchase.category}\nPublication Date: ${formatDate(purchase.publication_date)}\nPrice at the moment: ${purchase.price} ₴\nPages: ${purchase.pages}\nLanguage: ${purchase.language}\nSummary: ${purchase.summary}\nRating: ${purchase.rating}`;
        return info;
    };

    const handleDelete = async (checkNumber) =>{
        try {
            const response = await fetch(`http://localhost:8081/delete-check/${checkNumber}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Could not delete check');
            }
            fetchChecks();
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div>
            <MenuBar />
            <div>
                <input
                    type="text"
                    placeholder="Search check by number..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-bar-checks"
                />
                {searchQuery === "" && (
                    <select className="sort-checks" value={filter}
                            onChange={(e) => handleFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                    </select>
                )}
                <button className="sort-checks" onClick={() => handleSort("check_number")}>
                    Sort by check number
                </button>
            </div>
            <div className="check page">
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
                                <p className="total-price">{check.total_price} грн</p>
                                <button className="open-check" onClick={() => handleOpenPopup(check)}>⇲</button>
                                <button className="delete-check" onClick={() => handleDelete(check.check_number)}>⛌</button>
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
        </div>
    );
}

export default PurchasesPage;
