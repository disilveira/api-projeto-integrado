const express = require('express');
const router = express.Router();
const mysql = require('../config/mysql').pool;
const multer = require('multer');
const crypto = require('crypto');
var path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, crypto.createHash('md5').update(new Date().getTime() + file.originalname).digest("hex") + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM products',
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    rows: result.length,
                    products: result.map(prod => {
                        return {
                            product_id: prod.product_id,
                            name: prod.name,
                            price: prod.price,
                            request: {
                                type: 'GET',
                                description: 'Retorna os detalhes do produto',
                                url: 'http://localhost:3000/produtos/' + prod.product_id
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )
    });
});

router.post('/', upload.single('product_image'), (req, res, next) => {
    console.log(req.file);
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'INSERT INTO products (name, price) VALUES (?, ?)',
            [req.body.name, req.body.price],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    message: 'Product created!',
                    product: {
                        product_id: result.product_id,
                        name: req.body.name,
                        price: req.body.price,
                        request: {
                            type: 'GET',
                            description: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos/'
                        }
                    }
                }
                res.status(201).send(response);
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

                if (result.length == 0) {
                    return res.status(404).send({ message: 'Product ID not found!' });
                }

                const response = {
                    product: {
                        product_id: result[0].product_id,
                        name: result[0].name,
                        price: result[0].price,
                        request: {
                            type: 'GET',
                            description: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos/'
                        }
                    }
                }
                return res.status(200).send(response)
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
                const response = {
                    message: 'Product updated!',
                    product: {
                        product_id: req.body.product_id,
                        name: req.body.name,
                        price: req.body.price,
                        request: {
                            type: 'GET',
                            description: 'Retorna os detalhes do produto',
                            url: 'http://localhost:3000/produtos/' + req.body.product_id
                        }
                    }
                }
                res.status(202).send(response);
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
                const response = {
                    message: 'Product deleted!',
                    request: {
                        type: 'POST',
                        description: 'Insere um produto',
                        url: 'http://localhost:3000/produtos/',
                        body: {
                            name: 'String',
                            price: 'Number'
                        }
                    }
                }
                res.status(202).send(response);
            }
        )
    });
});

module.exports = router;