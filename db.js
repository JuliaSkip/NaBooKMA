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
