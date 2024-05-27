import React, {useEffect, useState} from "react";
import MenuBar from "../MenuBar/MenuBar";

function BooksPage (){

    const [fetchError, setFetchError] = useState(null);
    const [books, setBooks] = useState([]);
    const [sortBy, setSortBy] = useState("cust_surname");
    const [sortOrder, setSortOrder] = useState("ASC");



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



    return (
        <div>
            <MenuBar />
            <div>
            </div>
        </div>
    );

}

export default BooksPage;