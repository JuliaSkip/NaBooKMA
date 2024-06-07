import React, { useEffect, useState } from "react";
import MenuBar from "../MenuBar/MenuBar";
import "./BooksPageStyles.css";
import fictionImage from "../BooksPage/fiction.png";
import forKidsImage from "../BooksPage/for-kids.png";
import romanceImage from "../BooksPage/romance.png";
import nonFictionImage from "../BooksPage/non-fiction.png";
import allImage from "../BooksPage/all.png";
import { getSupabaseClient } from '../authclient';

const supabase = getSupabaseClient();

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
    const [email, setEmail] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);

    const [searchAuthor, setSearchAuthor] = useState("");
    const [searchGenre, setSearchGenre] = useState("");
    const [searchPrice, setSearchPrice] = useState("");
    const [searchYear, setSearchYear] = useState("");
    const [searchRating, setSearchRating] = useState("");

    const [basket, setBasket] = useState([]);

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

    /**
     * Fetches book data from the specified endpoint and updates the state with the fetched data.
     * The function sends a GET request to `http://localhost:8081/get-books` with query parameters
     * for sorting the data (`sortBy` and `sortOrder`), language, and category. Upon a successful
     * response, it parses the JSON data and updates the state with the book data. If the request fails,
     * it sets an error message and clears the book data.
     */
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

    /**
     * Handles changes to the book edit form by updating the state with the new values.
     * This function is triggered on each change in the edit form fields. It updates the `popupBook`
     * state with the current value of the changed input field.
     */
    const handleEditBookChange = (e) => {
        const { name, value } = e.target;
        setPopupBook((prevBook) => ({ ...prevBook, [name]: value }));
    };


    /**
     * Fetches the basket data for a specific customer from the specified endpoint and updates the state with the fetched data.
     * The function sends a GET request to `http://localhost:8081/get-basket` with the customer's email as a query parameter.
     * Upon a successful response, it parses the JSON data and updates the state with the basket data. If the request fails,
     * it sets the basket state to an empty array.
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
     * Handles the submission of the book edit form.
     * This function is triggered on form submission. It uploads the book photo to Supabase storage
     * if a new photo is provided. Then it sends a PUT request to update the book details. If the
     * request is successful, it closes the edit popup and fetches the updated books.
     */
    const handleEditBookSubmit = async (e) => {
        e.preventDefault();
        let photoUrl = popupBook.book_photo_url;
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

            photoUrl = 'https://upkigeauanwefsngyhqb.supabase.co/storage/v1/object/public/photos/'+`${photo.name}`;
        }

        const bookToSubmit = { ...popupBook, book_photo_url: photoUrl };
        console.log('Submitting book update:', bookToSubmit);
        try {
            const response = await fetch(`http://localhost:8081/update-book/${popupBook.book_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bookToSubmit)
            });

            if (!response.ok) {
                throw new Error("Could not update book");
            }

            const result = await response.json();
            console.log('Book updated successfully:', result);

            setShowEditPopup(false);
            fetchBooks();
        } catch (error) {
            console.error("Error editing book:", error.message);
        }
    };

    /**
     * useEffect hook to fetch books whenever the sorting parameters, language, or category change.
     * This hook calls the `fetchBooks` function whenever the values of `sortBy`, `sortOrder`, `language`,
     * or `category` change. It ensures that the book data is always fetched and updated based on the current
     * sorting preferences, language, and category.
     */
    useEffect(() => {
        fetchBooks();
    }, [sortBy, sortOrder, language, category]);

    /**
     * useEffect hook to fetch the basket data whenever the `basket` state changes.
     * This hook calls the `fetchBasket` function whenever the `basket` state changes. It ensures that
     * the basket data is always fetched and updated based on the current state.
     */
    useEffect(() => {
        fetchBasket(email);
    }, [basket]);

    /**
     * Handles the search input change by updating the search query state.
     * This function is triggered on each keystroke in the search input field. It updates the
     * `searchQuery` state with the current value of the input field.
     */
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    /**
     * Handles the author search input change by updating the search author state.
     * This function is triggered on each keystroke in the author search input field. It updates the
     * `searchAuthor` state with the current value of the input field.
     */
    const handleSearchAuthor = (e) => {
        setSearchAuthor(e.target.value);
    };

    /**
     * Handles the genre search input change by updating the search genre state.
     * This function is triggered on each keystroke in the genre search input field. It updates the
     * `searchGenre` state with the current value of the input field.
     */
    const handleSearchGenre = (e) => {
        setSearchGenre(e.target.value);
    };

    /**
     * Handles the rating search input change by updating the search rating state.
     * This function is triggered on each keystroke in the rating search input field. It updates the
     * `searchRating` state with the current value of the input field.
     */
    const handleSearchRating = (e) => {
        setSearchRating(e.target.value);
    };

    /**
     * Handles the year search input change by updating the search year state.
     * This function is triggered on each keystroke in the year search input field. It updates the
     * `searchYear` state with the current value of the input field.
     */
    const handleSearchYear = (e) => {
        setSearchYear(e.target.value);
    };

    /**
     * Handles the language selection change by updating the language state.
     * This function is triggered when the language selection changes. It updates the `language` state
     * with the selected language.
     */
    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    /**
     * Handles the category selection change by updating the category state.
     * This function is triggered when the category selection changes. It updates the `category` state
     * with the selected category.
     */
    const handleCategoryChange = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    /**
     * Handles changes to the add book form by updating the state with the new values.
     * This function is triggered on each change in the add book form fields. It updates the `newBook`
     * state with the current value of the changed input field.
     */
    const handleAddBookChange = (e) => {
        const { name, value } = e.target;
        setNewBook((prevBook) => ({ ...prevBook, [name]: value }));
    };


    /**
     * Handles the submission of the add book form.
     * This function is triggered on form submission. It uploads the book photo to Supabase storage
     * if a new photo is provided. Then it sends a POST request to add the new book. If the
     * request is successful, it resets the form and fetches the updated books.
     */
    const handleAddBookSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoUrl = "https://upkigeauanwefsngyhqb.supabase.co/storage/v1/object/public/photos/default-book-icon.png"
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

                photoUrl = 'https://upkigeauanwefsngyhqb.supabase.co/storage/v1/object/public/photos/'+`${photo.name}`;
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


    /**
     * Handles the deletion of a book.
     * This function is triggered when a book is to be deleted. It sends a DELETE request to remove
     * the book. If the request is successful, it fetches the updated books and closes any open popups.
     */
    const handleDeleteBook = async (bookId) => {
        const confirmed = window.confirm("Are you sure you want to delete this book?");
        if (confirmed) {
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
        }
    };

    /**
     * Filters the books based on various search criteria.
     * This function filters the books based on title, author, genre, price, rating, publication year,
     * language, and category. It returns the filtered list of books.
     */
    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().startsWith(searchQuery.toLowerCase());
        const matchesAuthor = book.author_name.toLowerCase().startsWith(searchAuthor.toLowerCase());
        const matchesGenre = book.genre.toLowerCase().startsWith(searchGenre.toLowerCase());
        const matchesPrice = searchPrice ? book.price <= parseFloat(searchPrice) : true;
        const matchesRating = searchRating ? book.rating = parseFloat(searchRating) : true;
        const matchesYear = searchYear ? book.publication_date.startsWith(searchYear) : true;
        const matchesLanguage = language === "all" || book.language === language;
        const matchesCategory = category === "all" || book.category === category;
        return matchesSearch && matchesAuthor && matchesGenre && matchesPrice && matchesYear
            && matchesLanguage && matchesCategory && matchesRating;
    });


    /**
     * Handles sorting the books.
     * This function is triggered when the sorting option is changed. It updates the sorting column
     * and order based on the selected value.
     */
    const handleSort = (e) => {
        const [columnName, order] = e.target.value.split("-");
        setSortBy(columnName);
        setSortOrder(order);
    };

    /**
     * Handles opening the popup for a book.
     * This function is triggered when a book is clicked. It sets the selected book in the state and
     * opens the popup to display the book details.
     */
    const handlePopup = (book) => {
        setPopupBook(book);
        setShowPopup(true);
        setShowEditPopup(false);
    };


    /**
     * Handles opening the edit popup for a book.
     * This function is triggered when the edit button is clicked. It sets the selected book in the state
     * and opens the edit popup to modify the book details.
     */
    const handleEditPopup = (e, book) => {
        e.stopPropagation();
        setPopupBook(book);
        setShowEditPopup(true);
        setShowPopup(false);

    };


    /**
     * Closes the book detail or edit popup.
     * This function is triggered when the close button is clicked. It closes the currently open popup.
     */
    const handleClosePopup = () => {
        setShowPopup(false);
        setShowEditPopup(false);
        setPopupBook(null);
    };


    /**
     * Formats a date string into a human-readable format.
     * This function formats a date string into a more readable format using the `en-US` locale.
     */
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };


    /**
     * Renders star icons based on the rating.
     * This function generates star icons for a given rating. Filled stars are rendered for the rating value,
     * and empty stars for the remaining count up to 5.
     */
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

    /**
     * useEffect hook to fetch the basket data and user details from local storage on initial render.
     * This hook retrieves the user's ID and email from local storage and fetches the basket data if an email is found.
     */
    useEffect(() => {
        const storedId = localStorage.getItem('id');
        if (storedId) {
            setId(storedId)
        }
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            fetchBasket(storedEmail);
            setEmail(storedEmail)
        }
    }, []);


    /**
     * Gets the current date in YYYY-MM-DD format.
     * This function generates a string representing the current date in the format YYYY-MM-DD.
     */
    function getCurrentDate() {
        const today = new Date();
        const year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();

        if (month < 10) {
            month = `0${month}`;
        }
        if (day < 10) {
            day = `0${day}`;
        }

        return `${year}-${month}-${day}`;
    }


    /**
     * Handles adding a book to the basket.
     * This function is triggered when the add to basket button is clicked. It sends a POST request to add
     * the selected book to the basket. If the request is successful, it fetches the updated basket data.
     */
    const handleAddToBasket = async (e, book) => {
        const confirmed = window.confirm("Are you sure you want to add this book to basket?");
        if (confirmed) {
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
            fetchBasket(email)
        } catch (error) {
            console.error("Error adding book:", error.message);
        }
        }

    };


    return (
        <div className="entire-page">
            <MenuBar length_b={basket.length}/>
            <div className="book-actions">
                <div className="search-container">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by title..."
                    />
                    <input
                        type="text"
                        value={searchAuthor}
                        onChange={handleSearchAuthor}
                        placeholder="Search by author..."
                    />
                    <input
                        type="text"
                        value={searchGenre}
                        onChange={handleSearchGenre}
                        placeholder="Search by genre..."
                    />
                    <input
                        type="number"
                        value={searchRating}
                        onChange={handleSearchRating}
                        placeholder="Search by rating..."
                    />
                    <input
                        type="number"
                        value={searchYear}
                        onChange={handleSearchYear}
                        placeholder="Search by year..."
                    />
                </div>
                <select className="language-select" id="sort-books" value={`${sortBy}-${sortOrder}`}
                        onChange={handleSort}>
                    <option value="title-ASC">Title A-Z</option>
                    <option value="title-DESC">Title Z-A</option>
                    <option value="publication_date-ASC">Oldest First</option>
                    <option value="publication_date-DESC">Newest First</option>
                    <option value="rating-ASC">Lowest Rating</option>
                    <option value="rating-DESC">Highest Rating</option>
                    <option value="price-ASC">Сheap First</option>
                    <option value="price-DESC">Expensive First</option>
                </select>
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="language-select"
                >
                    <option value="all">All languages</option>
                    <option value="Українська">Українська</option>
                    <option value="English">English</option>
                </select>
            {id === "0" && (<div style={{marginTop: "20px"}}>
                <button className="add-book-button" onClick={() => setShowAddForm(!showAddForm)}>
                    Add Book
                </button>
            </div>)}
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
                        onKeyPress={(e) => {
                            const charCode = e.which ? e.which : e.keyCode;
                            if (!(charCode >= 65 && charCode <= 90) &&
                                !(charCode >= 97 && charCode <= 122) &&
                                charCode !== 32 && charCode !== 45 && charCode !== 95) {
                                e.preventDefault();
                            }
                        }}
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
                        type="text"
                        name="isbn"
                        placeholder="ISBN"
                        value={newBook.isbn}
                        onChange={handleAddBookChange}
                        onKeyPress={(e) => {
                            const charCode = e.which ? e.which : e.keyCode;
                            if (!((charCode >= 48 && charCode <= 57) || charCode === 45)) {
                                e.preventDefault();
                            }
                        }}
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
                        max={getCurrentDate()}
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
                        type="file"
                        id="photo"
                        onChange={(e) => setPhoto(e.target.files[0])}
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
                            { id !== "0" && (<button className="basket-button" onClick={(e) => handleAddToBasket(e, book)}>
                                Add to Basket
                            </button>)}
                            { id === "0" && (<button className="basket-button" onClick={(e) => handleEditPopup(e, book)}>
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
                                {id === "0" && ( <button className="delete-button" onClick={() => handleDeleteBook(popupBook.book_id)}>
                                    Delete Book
                                </button>)}
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
                                <form onSubmit={handleEditBookSubmit} className="edit-form">
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
                                        onKeyPress={(e) => {
                                            const charCode = e.which ? e.which : e.keyCode;
                                            if (!(charCode >= 65 && charCode <= 90) &&
                                                !(charCode >= 97 && charCode <= 122) &&
                                                charCode !== 32 && charCode !== 45 && charCode !== 95) {
                                                e.preventDefault();
                                            }
                                        }}
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
                                        max={getCurrentDate()}
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
