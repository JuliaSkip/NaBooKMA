import './MenuBarStyles.css';
import nabookma from './NaBOOKMA__1_-removebg-preview.png'
import {NavLink} from "react-router-dom";
import basketIcon from './basket.png';
import React, {useEffect, useState} from "react";

const MenuBar = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [basket, setBasket] = useState([]);
    const [id, setId] = useState([]);
    const [email, setEmail] = useState([]);



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
            fetchBasket(email)
        } catch (error) {
            console.error("Error adding book:", error.message);
        }
    };

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

    const handleDelete = async (bookId) => {
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

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            fetchBasket(storedEmail)
            setEmail(storedEmail)
        }
        const storedId = localStorage.getItem('id');
        if (storedId) {
            setId(storedId)
        }
    }, []);

    const handleBasket = () =>{
        if(showPopup){
            setShowPopup(false)
        }else{
            setShowPopup(true)
            fetchBasket(email)
        }
    }

    return (
        <div>
            {showPopup && (
                <div className="overlay-basket show">
                    <div className="basket-content">
                        <h2>Your Basket</h2>
                        {basket.map((book, index) => (
                            <div className="basket-card">
                                <img src={book.book_photo_url} alt={book.title} className="basket-photo"/>
                                <div className="book-details">
                                    <h3>{book.title}</h3>
                                    <p>Author: {book.author_name}</p>
                                    <p>Price: ${book.price}</p>
                                    <p>Quantity: {book.amount}</p>
                                    <button className="basket-actions" onClick={() => handleAddToBasket(book)}>+</button>
                                    <button className="basket-actions" onClick={() => handleDecrement(book)}>-</button>
                                    <button className="basket-actions" onClick={() => handleDelete(book.id)}>delete</button>
                                </div>

                            </div>
                        ))}
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
                        <img src={nabookma} alt="Your Alt Text"/>
                        <li className="nav-item">
                            <NavLink to="/customers" className="nav-link" activeClassName="active">Customers</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/purchases" className="nav-link" activeClassName="active">Purchases</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/books" className="nav-link" activeClassName="active">Books</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/me" className="nav-link" activeClassName="active">My profile</NavLink>
                        </li>
                        <li className="nav-item basket-icon">
                            <img src={basketIcon} alt="Basket" onClick={handleBasket}/>
                        </li>
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