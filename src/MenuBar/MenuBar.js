import './MenuBarStyles.css';
import nabookma from './NaBOOKMA__1_-removebg-preview.png'
import {NavLink} from "react-router-dom";
import basketIcon from './basket.png';
import React, {useEffect, useState} from "react";
import ConfirmationModal from '../MenuBar/Confirm';


const MenuBar = ({length_b}) => {
    const [showPopup, setShowPopup] = useState(false);
    const [basket, setBasket] = useState([]);
    const [id, setId] = useState(null);
    const [email, setEmail] = useState(null);
    const [confirmation, setConfirmation] = useState({ show: false, message: "", onConfirm: null, onCancel: null });




    /**
     * Fetches the basket items for the given customer email.
     * This function sends a GET request to fetch the basket items associated with the provided email.
     */
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


    /**
     * Handles adding a book to the basket.
     * This function sends a POST request to add the given book to the basket.
     */
    const handleAddToBasket = async (book) => {
            try {
                const response = await fetch("http://localhost:8081/add-book-to-basket", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        book_id: book.book_id,
                        customer_id: id,
                    })
                });
                if (!response.ok) {
                    throw new Error("Could not add book");
                }
                fetchBasket(email);
            } catch (error) {
                console.error("Error adding book:", error.message);
            }
    };


    // Similar functions handleDecrement, handleDelete, and handleOrder for modifying and managing the basket
    const handleDecrement = async (book) => {
        try {
            const response = await fetch("http://localhost:8081/decrement-book-in-basket", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    book_id: book.book_id,
                    customer_id: id
                })
            });
            if (!response.ok) {
                throw new Error("Could not decrement book quantity");
            }
            fetchBasket(email);
        } catch (error) {
            console.error("Error decrementing book quantity:", error.message);
        }
    };

    const handleDelete = (bookId, bookTitle) => {
        setConfirmation({
            show: true,
            message: `Remove "${bookTitle}" from your basket?`,
            onConfirm: () => confirmDelete(bookId),
            onCancel: () => setConfirmation({ show: false, message: "", onConfirm: null, onCancel: null })
        });
    };

    const confirmDelete = async (bookId) => {
        setConfirmation({ show: false, message: "", onConfirm: null, onCancel: null });
        try {
            const response = await fetch(`http://localhost:8081/delete-book-from-basket/${bookId}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error("Could not delete book from basket");
            }
            fetchBasket(email);
        } catch (error) {
            console.error("Error deleting book from basket:", error.message);
        }
    };

    // Effect hook to fetch basket data when the component mounts or when basket state changes
    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setEmail(storedEmail);
            fetchBasket(storedEmail);
        }
        const storedId = localStorage.getItem('id');
        if (storedId) {
            setId(storedId);
        }
    }, [basket]);


    /**
     * Handles toggling the visibility of the basket popup.
     * This function toggles the visibility of the basket popup and fetches basket data if it's being shown.
     */
    const handleBasket = () => {
        if (showPopup) {
            setShowPopup(false);
        } else {
            setShowPopup(true);
            fetchBasket(email);
        }
    };


    /**
     * Handles placing an order for the items in the basket.
     * This function creates a check, adds purchases for each item in the basket, and clears the basket.
     */

    const handleOrder = () => {
        if (basket.length === 0) {
            window.alert("Your basket is empty!");
        } else {
            setConfirmation({
                show: true,
                message: "Are you sure you want to make an order?",
                onConfirm: confirmOrder,
                onCancel: () => setConfirmation({ show: false, message: "", onConfirm: null, onCancel: null })
            });
        }
    };

    const confirmOrder = async () => {
        setConfirmation({ show: false, message: "", onConfirm: null, onCancel: null });
        try {
            const checkResponse = await fetch("http://localhost:8081/create-check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    total_price: 0,
                    customer_id: id,
                    print_date: new Date().toISOString(),
                    status: 'pending'
                })
            });

            if (!checkResponse.ok) {
                throw new Error("Could not create check");
            }

            const checkData = await checkResponse.json();
            const checkNumber = checkData.check_number;

            for (const book of basket) {
                const purchaseResponse = await fetch("http://localhost:8081/add-purchase", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        book_id: book.book_id,
                        check_number: checkNumber,
                        quantity: book.amount,
                        selling_price: 0
                    })
                });

                if (!purchaseResponse.ok) {
                    throw new Error("Could not add purchase");
                }

                confirmDelete(book.id);
            }

            setBasket([]);
            setShowPopup(false);
            setConfirmation({
                show: true,
                message: "Order placed successfully!",
                onConfirm: () => {
                    setConfirmation({ show: false, message: "", onConfirm: null, onCancel: null });
                },
                onCancel: null
            });

        } catch (error) {
            console.error("Error placing order:", error.message);
            alert("Error placing order. Please try again.");
        }
    };


    /**
     * Calculates the total sum of the items in the basket.
     */
    const calculateTotalSum = (basket) => {
        return basket.reduce((total, item) => total + (item.price * item.amount), 0);
    };

    const totalSum = calculateTotalSum(basket);

    return (
        <div>
            {confirmation.show && (
                <ConfirmationModal
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onCancel={confirmation.onCancel}
                />
            )}
            {showPopup && (
                <div className="overlay-basket show">
                    <div className="basket-content">
                        <h2>Your Basket</h2>
                        {basket.map((book, index) => (
                            <div className="basket-card" key={index}>
                                <img src={book.book_photo_url} alt={book.title} className="basket-photo"/>
                                <div className="book-details">
                                    <h3>{book.title}</h3>
                                    <p>Author: {book.author_name}</p>
                                    <p>Price: ${book.price}</p>
                                    <p>Quantity: {book.amount}</p>
                                    <button className="basket-actions" onClick={() => handleAddToBasket(book)}>+</button>
                                    <button className="basket-actions" onClick={() => handleDecrement(book)}>-</button>
                                    <button className="basket-actions" onClick={() => handleDelete(book.id, book.title)}>delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="buy-section">
                        <h3 className="total-sum">Total: ${totalSum.toFixed(2)}</h3>
                        <button className="buy-button" onClick={handleOrder}>Buy</button>
                    </div>
                </div>
            )}
            <header className="menu-bar">
                <nav className="navbar">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink to="/nabookma" className="nav-link" activeClassName="active">
                                <span className="nabookma">Na<span className="book">BooK</span>MA</span>
                            </NavLink>
                        </li>
                        <img src={nabookma} alt="Your Alt Text" className="book-icon"/>
                        {id === "0" && (
                            <li className="nav-item">
                                <NavLink to="/customers" className="nav-link" activeClassName="active">Customers</NavLink>
                            </li>
                        )}
                        {id === "0" && (
                            <li className="nav-item">
                                <NavLink to="/purchases" className="nav-link" activeClassName="active">Purchases</NavLink>
                            </li>
                        )}
                        <li className="nav-item">
                            <NavLink to="/books" className="nav-link" activeClassName="active">Books</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/me" className="nav-link" activeClassName="active">My profile</NavLink>
                        </li>
                        {id !== "0" && !showPopup && (
                            <li className="nav-item basket-icon">
                                <div className="basket-container" onClick={handleBasket}>
                                    <img src={basketIcon} alt="Basket" />
                                    {length_b> 0 && <span className="basket-count">{length_b}</span>}
                                </div>
                            </li>
                        )}
                        {id !== "0" && showPopup && (
                            <li className="nav-item basket-icon">
                                <div className="basket-container" onClick={handleBasket}>
                                    <img src={basketIcon} alt="Basket" />
                                    {basket.length> 0 && <span className="basket-count">{basket.length}</span>}
                                </div>
                            </li>
                        )}
                        <li className="nav-item log-out">
                            <NavLink to="/" className="nav-link" activeClassName="active">Log out</NavLink>
                        </li>
                    </ul>
                </nav>
            </header>
        </div>
    );
};

export default MenuBar;


