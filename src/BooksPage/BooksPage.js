import React, { useEffect, useState } from "react";
import MenuBar from "../MenuBar/MenuBar";
import "./BooksPageStyles.css";
import fictionImage from "../BooksPage/fiction.png";
import forKidsImage from "../BooksPage/for-kids.png";
import romanceImage from "../BooksPage/romance.png";
import nonFictionImage from "../BooksPage/non-fiction.png";
import allImage from "../BooksPage/all.png";


function BooksPage() {
    const [fetchError, setFetchError] = useState(null);
    const [books, setBooks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupBook, setPopupBook] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("title");
    const [sortOrder, setSortOrder] = useState("ASC");
    const [language, setLanguage] = useState("all");
    const [category, setCategory] = useState("all"); // Add category state

    const fetchBooks = async () => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-books?sortBy=${sortBy}&sortOrder=${sortOrder}`
            );
            if (!response.ok) {
                throw new Error("Could not fetch books");
            }
            const data = await response.json();
            setBooks(data);
            setFetchError(null);
        } catch (error) {
            setFetchError(error.message);
            setBooks([]);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [sortBy, sortOrder]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleCategoryChange = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLanguage = language === "all" || book.language === language;
        const matchesCategory = category === "all" || book.category === category;
        return matchesSearch && matchesLanguage && matchesCategory;
    });

    const handleSort = (columnName) => {
        if (sortBy === columnName) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(columnName);
            setSortOrder("ASC");
        }
    };

    const handlePopup = (book) => {
        setPopupBook(book);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setPopupBook(null);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars.push(<img key={i} src="/star-filled.png" alt="star" className="star-icon" />);
            } else {
                stars.push(<img key={i} src="/star-empty.png" alt="star" className="star-icon" />);
            }
        }
        return stars;
    };

    return (
        <div>
            <MenuBar/>
            <div>
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-bar-books"
                />
                <button
                    className="sort-books"
                    onClick={() => handleSort("title")}
                >
                    Sort by title
                </button>
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="language-select"
                >
                    <option value="all">All</option>
                    <option value="Українська">Українська</option>
                    <option value="English">English</option>
                </select>
            </div>
            <div className="category-buttons">
                <div>
                    <img
                        className="categories-photo"
                        src={allImage}
                        alt="All"
                        onClick={() => handleCategoryChange("all")}
                        style={{cursor: 'pointer'}} // Optional: makes it clear that the image is clickable
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={fictionImage}
                        alt="Fiction"
                        onClick={() => handleCategoryChange("Fiction")}
                        style={{cursor: 'pointer'}} // Optional: makes it clear that the image is clickable
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={forKidsImage}
                        alt="For Kids"
                        onClick={() => handleCategoryChange("For Children")}
                        style={{cursor: 'pointer'}} // Optional: makes it clear that the image is clickable
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={romanceImage}
                        alt="Romance"
                        onClick={() => handleCategoryChange("Romance")}
                        style={{cursor: 'pointer'}} // Optional: makes it clear that the image is clickable
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={nonFictionImage}
                        alt="Non-Fiction"
                        onClick={() => handleCategoryChange("Non-Fiction")}
                        style={{cursor: 'pointer'}} // Optional: makes it clear that the image is clickable
                    />
                </div>

            </div>
            <div className="book-cards">
                {filteredBooks.map((book) => (
                    <div
                        key={book.book_id}
                        className="book-card"
                        onClick={() => handlePopup(book)}
                    >
                        {book.book_photo_url && (
                            <img
                                src={book.book_photo_url}
                                alt="Book Cover"
                                className="book-photo"
                            />
                        )}
                        <div className="book-info">
                            <h2>{book.title}</h2>
                            <p className="author-name">Author: {book.author_name}</p>
                            <div className="rating">{renderStars(book.rating)}</div>
                        </div>
                    </div>
                ))}
            </div>
            {popupBook && showPopup && (
                <>
                    <div className="overlay" onClick={handleClosePopup}></div>
                    <div className="popup-container-book">
                        <div className="popup">
                            <div className="popup-content-book">
                                <span className="close" onClick={handleClosePopup}>&times;</span>
                                {popupBook.book_photo_url && (
                                    <img
                                        src={popupBook.book_photo_url}
                                        alt="Book Cover"
                                        className="book-photo"
                                    />
                                )}
                                <h2>{popupBook.title}</h2>
                                <p><b>Author:</b> {popupBook.author_name}</p>
                                <p><b>Genre:</b> {popupBook.genre}</p>
                                <div className="rating">{renderStars(popupBook.rating)}</div>
                                <p className="price">${popupBook.price}</p>
                                <p><b>Publisher:</b> {popupBook.publisher_name}</p>
                                <p><b>Published Date:</b> {formatDate(popupBook.publication_date)}</p>
                                <p><b>Description:</b> {popupBook.summary}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {fetchError && <div>Error: {fetchError}</div>}
            {filteredBooks.length === 0 && <div className="error-message"><h2>No books found.</h2></div>}
            {filteredBooks.length !== 0 &&
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

export default BooksPage;
