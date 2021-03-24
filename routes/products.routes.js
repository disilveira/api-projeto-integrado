const express = require('express');
const router = express.Router();
const mysql = require('../config/mysql').pool;

router.get('/', (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }

        conn.query(
            'SELECT * FROM products',
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: result })
            }
        )

    });
});

router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) => {

        if (error) { return res.status(500).send({ error: error }) }

        conn.query(
            'INSERT INTO products (name, price) VALUES (?, ?)',
            [req.body.name, req.body.price],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                res.status(201).send({
                    message: "Product created!",
                    product_id: result.insertId
                });
            }
        )
    });
});

router.get('/:product_id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }

        conn.query(
            'SELECT * FROM products WHERE product_id = ?',
            [req.params.product_id],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: result })
            }
        )

    });
});

router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) { return res.status(500).send({ error: error }) }

        conn.query(
            `UPDATE products
            SET name = ?,
                price = ?
            WHERE product_id = ?`,
            [req.body.name, req.body.price, req.body.product_id],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                res.status(202).send({
                    message: "Product updated!"
                });
            }
        )
    });
});

router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) { return res.status(500).send({ error: error }) }

        conn.query(
            `DELETE FROM products WHERE product_id = ?`, [req.body.product_id],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                res.status(202).send({
                    message: "Product deleted!"
                });
            }
        )
    });
});

module.exports = router;