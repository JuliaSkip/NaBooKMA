import React, { useEffect, useState } from "react";
import MenuBar from "../MenuBar/MenuBar";
import "./BooksPageStyles.css";
import fictionImage from "../BooksPage/fiction.png";
import forKidsImage from "../BooksPage/for-kids.png";
import romanceImage from "../BooksPage/romance.png";
import nonFictionImage from "../BooksPage/non-fiction.png";
import allImage from "../BooksPage/all.png";
import { createClient } from "@supabase/supabase-js";


function BooksPage() {
    const [fetchError, setFetchError] = useState(null);
    const [books, setBooks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [formError, setFormError] = useState('');
    const [popupBook, setPopupBook] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("title");
    const [sortOrder, setSortOrder] = useState("ASC");
    const [language, setLanguage] = useState("all");
    const [category, setCategory] = useState("all");
    const [showAddForm, setShowAddForm] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [id, setId] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);



    const [newBook, setNewBook] = useState({
        id_book: "",
        title: "",
        author_name: "",
        genre: "",
        rating: "",
        price: "",
        publisher_name: "",
        publication_date: "",
        summary: "",
        book_photo_url: null,
        language: "",
        category: ""
    });

    const supabase = createClient('https://upkigeauanwefsngyhqb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2lnZWF1YW53bmd5aHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjQxOTQsImV4cCI6MjAzMTgwMDE5NH0.s60GCwAeFC5zdmGKiJ0oxm7WXf2gcsCUWkUhEguUlvM');

    const fetchBooks = async () => {
        try {
            const response = await fetch(
                `http://localhost:8081/get-books?sortBy=${sortBy}&sortOrder=${sortOrder}&language=${language}&category=${category}`
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

    const handleEditBookChange = (e) => {
        const { name, value } = e.target;
        setPopupBook((prevBook) => ({ ...prevBook, [name]: value }));
    };
    const handleEditBookSubmit = async (e) => {
        e.preventDefault();try {
            const response = await fetch(`http://localhost:8081/update-book/${popupBook.book_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(popupBook)
            });
            if (!response.ok) {
                throw new Error("Could not update book");
            }
            const result = await response.json();

            setShowEditPopup(false);
            fetchBooks();
        } catch (error) {
            console.error("Error editing book:", error.message);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [sortBy, sortOrder, language, category]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleCategoryChange = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    const handleAddBookChange = (e) => {
        const { name, value } = e.target;
        setNewBook((prevBook) => ({ ...prevBook, [name]: value }));
    };

    const handleAddBookSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoUrl = null;
            if (photo) {
                const { data, error } = await supabase.storage
                    .from('photos')
                    .upload(`${photo.name}`, photo, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (error) {
                    console.error('Error uploading photo:', error.message);
                    setFormError('Error uploading photo. Please try again.');
                    return;
                }

                photoUrl = `https://upkigeauanwefsngyhqb.supabase.co/storage/v1/object/public/photos/${photo.name}`;
            }

            const bookToSubmit = { ...newBook, book_photo_url: photoUrl };
            const response = await fetch("http://localhost:8081/add-book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bookToSubmit)
            });
            if (!response.ok) {
                throw new Error("Could not add book");
            }
            const result = await response.json();

            setNewBook({
                id_book: "",
                title: "",
                author_name: "",
                genre: "",
                rating: "",
                isbn: "",
                pages: "",
                price: "",
                publisher_name: "",
                publication_date: "",
                summary: "",
                book_photo_url: null,
                language: "",
                category: ""
            });
            setPhoto(null);
            setShowAddForm(false);
            fetchBooks();
        } catch (error) {
            console.error("Error adding book:", error.message);
        }
    };

    const handleDeleteBook = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:8081/delete-book/${bookId}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error("Could not delete book");
            }
            fetchBooks();
            setShowPopup(false);
        } catch (error) {
            console.error("Error deleting book:", error.message);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().startsWith(searchQuery.toLowerCase());
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
        setShowEditPopup(false);
    };

    const handleEditPopup = (e, book) => {
        e.stopPropagation();
        setPopupBook(book);
        setShowEditPopup(true);
        setShowPopup(false);

    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setShowEditPopup(false);
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

    useEffect(() => {
        const storedId = localStorage.getItem('id');
        if (storedId) {
            setId(storedId)
        }
    }, []);

    const handleAddToBasket = async (e, book) => {
        e.stopPropagation();
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
        } catch (error) {
            console.error("Error adding book:", error.message);
        }
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
            <div style={{ marginTop: "20px" }}>
                <button className="add-book-button" onClick={() => setShowAddForm(!showAddForm)}>
                    Add Book
                </button>
            </div>


            {showAddForm && (
                <form className="add-book-form" onSubmit={handleAddBookSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={newBook.title}
                        onChange={handleAddBookChange}
                        required
                    />
                    <input
                        type="text"
                        name="author_name"
                        placeholder="Author Name"
                        value={newBook.author_name}
                        onChange={handleAddBookChange}
                        required
                    />
                    <input
                        type="text"
                        name="genre"
                        placeholder="Genre"
                        value={newBook.genre}
                        onChange={handleAddBookChange}
                        required
                    />
                    <input
                        type="number"
                        name="rating"
                        placeholder="Rating"
                        value={newBook.rating}
                        onChange={handleAddBookChange}
                        min="0"
                        max="5" step="1"
                        required
                    />
                    <input
                        type="number"
                        name="isbn"
                        placeholder="ISBN"
                        value={newBook.isbn}
                        onChange={handleAddBookChange}
                        required
                    />
                    <input
                        type="number"
                        name="pages"
                        placeholder="Pages number"
                        value={newBook.pages}
                        onChange={handleAddBookChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={newBook.price}
                        onChange={handleAddBookChange}
                        required
                    />
                    <input
                        type="text"
                        name="publisher_name"
                        placeholder="Publisher Name"
                        value={newBook.publisher_name}
                        onChange={handleAddBookChange}
                        required
                    />
                    <input
                        type="date"
                        name="publication_date"
                        value={newBook.publication_date}
                        onChange={handleAddBookChange}
                        required
                    />
                    <textarea
                        name="summary"
                        placeholder="Summary"
                        value={newBook.summary}
                        onChange={handleAddBookChange}
                        required
                    />
                    <label htmlFor="photo">Profile image:</label>
                    <input
                        type="file" // Change input type to file
                        id="photo"
                        onChange={(e) => setPhoto(e.target.files[0])} // Store selected photo in state
                    />
                    <select
                        name="language"
                        value={newBook.language}
                        onChange={handleAddBookChange}
                        required
                    >
                        <option value="">Select Language</option>
                        <option value="Українська">Українська</option>
                        <option value="English">English</option>
                    </select>
                    <select
                        name="category"
                        value={newBook.category}
                        onChange={handleAddBookChange}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="Fiction">Fiction</option>
                        <option value="For Children">For Children</option>
                        <option value="Romance">Romance</option>
                        <option value="Non-Fiction">Non-Fiction</option>
                    </select>
                    <button type="submit">Submit</button>
                    <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                </form>
            )}



            <div className="category-buttons">
                <div>
                    <img
                        className="categories-photo"
                        src={allImage}
                        alt="All"
                        onClick={() => handleCategoryChange("all")}
                        style={{cursor: 'pointer'}}
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={fictionImage}
                        alt="Fiction"
                        onClick={() => handleCategoryChange("Fiction")}
                        style={{cursor: 'pointer'}}
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={forKidsImage}
                        alt="For Kids"
                        onClick={() => handleCategoryChange("For Children")}
                        style={{cursor: 'pointer'}}
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={romanceImage}
                        alt="Romance"
                        onClick={() => handleCategoryChange("Romance")}
                        style={{cursor: 'pointer'}}
                    />
                </div>
                <div>
                    <img
                        className="categories-photo"
                        src={nonFictionImage}
                        alt="Non-Fiction"
                        onClick={() => handleCategoryChange("Non-Fiction")}
                        style={{cursor: 'pointer'}}
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
                            <h2 className="book-title">{book.title}</h2>
                            <p className="author-name">Author: {book.author_name}</p>
                            <div className="rating">{renderStars(book.rating)}</div>
                            <p className="price">${book.price}</p>
                            { id !== '0' && (<button className="basket-button" onClick={(e) => handleAddToBasket(e, book)}>
                                Add to Basket
                            </button>)}
                            { id === '0' && (<button className="basket-button" onClick={(e) => handleEditPopup(e, book)}>
                                Edit
                            </button>)}
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
                                <p><b>Pages: </b>{popupBook.pages}</p>
                                <div className="rating">{renderStars(popupBook.rating)}</div>
                                <p className="price">${popupBook.price}</p>
                                <p><b>Publisher:</b> {popupBook.publisher_name}</p>
                                <p><b>Published Date:</b> {formatDate(popupBook.publication_date)}</p>
                                <p><b>Description:</b> {popupBook.summary}</p>
                                <button className="delete-button" onClick={() => handleDeleteBook(popupBook.book_id)}>
                                    Delete Book
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {popupBook && showEditPopup && (
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
                                <h2>Edit Book</h2>
                                <form onSubmit={handleEditBookSubmit} className="edit-form" >
                                    <input
                                        type="text"
                                        name="title"
                                        value={popupBook.title}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="author_name"
                                        value={popupBook.author_name}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="genre"
                                        value={popupBook.genre}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="rating"
                                        value={popupBook.rating}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="pages"
                                        value={popupBook.pages}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="price"
                                        value={popupBook.price}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="publisher_name"
                                        value={popupBook.publisher_name}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <input
                                        type="date"
                                        name="publication_date"
                                        value={popupBook.publication_date.split('T')[0]}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <textarea
                                        name="summary"
                                        value={popupBook.summary}
                                        onChange={handleEditBookChange}
                                        required
                                    />
                                    <label htmlFor="photo">Profile image:</label>
                                    <input
                                        type="file"
                                        id="photo"
                                        onChange={(e) => setPhoto(e.target.files[0])}
                                    />
                                    <button type="submit">Submit</button>
                                    <button type="button" onClick={() => setShowEditPopup(false)}>Cancel</button>
                                </form>
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
