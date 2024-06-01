const express = require('express');
const cors = require("cors");
const pgp = require('pg-promise')();
const app = express();
const cn = {
    connectionString: 'postgres://postgres.upkigeauanwefsngyhqb:NaBooKMA2024@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
};
const db = pgp(cn);

app.use(cors());
app.use(express.json());
app.get('/images/:imageName', (req, res) => {
    const { imageName } = req.params;
    res.sendFile(`/path/to/images/${imageName}`, { root: __dirname });
});

app.get('/get-customers', (req, res) =>{
    const { sortBy, sortOrder } = req.query;
    const orderBy = `${sortBy} ${sortOrder}`;
    db.any(`SELECT *
            FROM "Customers"
            ORDER BY ${orderBy}`)
        .then(result =>{
            res.json(result);
        })
        .catch(error => {
            res.status(500).json({error:error.message});
        });
});

app.get('/get-customer-by-email', (req, res) =>{
    const { email } = req.query;
    const email_cust = `${email}`;
    db.any(`SELECT *
            FROM "Customers"
            WHERE customer_email = $1;`, [email_cust])
        .then(result =>{
            res.json(result);
        })
        .catch(error => {
            res.status(500).json({error:error.message});
        });
});

app.get('/get-checks', (req, res) =>{
    const { sortBy, sortOrder } = req.query;
    const orderBy = `${sortBy} ${sortOrder}`;
    db.any(`SELECT *
                  FROM "Check" INNER JOIN public."Customers" C on "Check".customer_id = C.customer_id
                  ORDER BY ${orderBy};`)
        .then(result =>{
            res.json(result);
        })
        .catch(error => {
            res.status(500).json({error:error.message});
        });
});

app.get('/get-checks-by-customer', async (req, res) => {
    try {
        const { sortBy, sortOrder, customer_email } = req.query;
        const orderBy = `${sortBy} ${sortOrder}`;
        const email = customer_email;

        // Using parameterized query to prevent SQL injection
        const checks = await db.any(
            `SELECT * 
                    FROM "Check"
                    INNER JOIN "Customers" ON "Check".customer_id = "Customers".customer_id
                    WHERE "Customers".customer_email = $1
                    ORDER BY ${orderBy};`,
            [email]
        );

        res.json(checks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/get-purchases', (req, res) =>{
    const { check_number } = req.query;
    const number = `${check_number}`;
    db.any(`SELECT "Check".check_number, total_price, print_date, status,
                          "Purchases".book_id, quantity, selling_price,
                          "Customers".customer_email, cust_surname, cust_name, cust_patronymic,
                          "Books".isbn, title, author_name, publisher_name, genre, category, publication_date, price, pages, language, summary, rating, book_photo_url
                  FROM (("Check" INNER JOIN "Purchases" ON "Check".check_number = "Purchases".check_number)
                  INNER JOIN "Books" ON "Books".book_id = "Purchases".book_id)
                  INNER JOIN "Customers" ON "Customers".customer_id = "Check".customer_id
                  WHERE "Check".check_number = ${number};`)
        .then(result =>{
            res.json(result);
        })
        .catch(error => {
            res.status(500).json({error:error.message});
        });
});
app.put('/update-status', (req, res) => {
    const { check_number, status  } = req.query;
    const number = `${check_number}`;
    const newStatus = `${status}`
    db.none(`UPDATE "Check"
                    SET status = $1
                    WHERE check_number = $2;`, [newStatus, number])
        .then(() => {
            res.json({ message: 'Check updated successfully' });
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

app.get('/get-books', (req, res) =>{
    const { sortBy, sortOrder } = req.query;
    const orderBy = `${sortBy} ${sortOrder}`;
    db.any(`SELECT *
                  FROM "Books"
                  ORDER BY ${orderBy};`)
        .then(result =>{
            res.json(result);
        })
        .catch(error => {
            res.status(500).json({error:error.message});
        });
});

app.post('/registration', async (req, res) => {
    try {
        const { customer_email, password, cust_surname, cust_name, cust_patronymic, birth_date, phone_number, city, street, zip_code, customer_photo_url } = req.body;
        if (!customer_email || !password || !cust_surname || !cust_name || !phone_number || !city || !street || !zip_code) {
            throw new Error('Please provide all required fields');
        }
        await db.none(`INSERT INTO "Customers" (customer_email, password, cust_surname, cust_name, cust_patronymic, birth_date, phone_number, city, street, zip_code, customer_photo_url) 
                              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
            [customer_email, password, cust_surname, cust_name, cust_patronymic, birth_date, phone_number, city, street, zip_code, customer_photo_url]);

        res.json({ message: 'Customer added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding customer: ' + error.message });
    }
});

app.post('/add-book', async (req, res) => {
    try {
        const {
            title, author_name, genre, rating, price, publisher_name,
            publication_date, summary, book_photo_url, language,
            category, isbn, pages
        } = req.body;

        if (
            !title || !author_name || !genre || !rating || !price ||
            !publisher_name || !publication_date || !summary ||
            !language || !category || !isbn || !pages
        ) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        await db.none(`
            INSERT INTO "Books" (
                title, author_name, genre, rating, price,
                publisher_name, publication_date, summary,
                book_photo_url, language, category, isbn, pages
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10, $11, $12, $13
            );
        `, [
            title, author_name, genre, rating, price,
            publisher_name, publication_date, summary,
            book_photo_url, language, category, isbn, pages
        ]);

        res.json({ message: 'Book added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding book: ' + error.message });
    }
});

app.delete('/delete-book/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.none(`DELETE FROM "Books" WHERE book_id = $1`, [id]);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting book: ' + error.message });
    }
});

app.get('/get-book-by-id', (req, res) =>{
    const {id} = req.query;
    db.any(`SELECT *
                  FROM "Books"
                  WHERE book_id = $1`,[id])
        .then(result =>{
            res.json(result);
        })
        .catch(error => {
            res.status(500).json({error:error.message});
        });
});

app.get('/get-profile', (req, res) => {
    const { customer_email } = req.query;

    db.any(`SELECT * FROM "Customers" WHERE LOWER(customer_email) = LOWER($1)`, [customer_email])
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.error('Database query error:', error);
            res.status(500).json({ error: error.message });
        });
});



/*
* *
* *
* *
* *
* *
* *
port
* *
* *
* *
* *
* *
* *
 */
const PORT = 8081
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
