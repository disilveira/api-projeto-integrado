const mysql = require('../config/mysql').pool;

exports.getProducts = (req, res, next) => {
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
                            product_image: prod.product_image,
                            request: {
                                type: 'GET',
                                description: 'Retorna os detalhes do produto',
                                url: process.env.URL_API + 'products/' + prod.product_id
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )
    });
}

exports.postProduct = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'INSERT INTO products (name, price, product_image) VALUES (?, ?, ?)',
            [req.body.name, req.body.price, req.file.filename],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    message: 'Product created!',
                    product: {
                        product_id: result.insertId,
                        name: req.body.name,
                        price: req.body.price,
                        product_image: req.file.filename,
                        request: {
                            type: 'GET',
                            description: 'Retorna todos os produtos',
                            url: process.env.URL_API + 'products/'
                        }
                    }
                }
                res.status(201).send(response);
            }
        )
    });
}

exports.getProductById = (req, res, next) => {
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
                        product_image: result[0].product_image,
                        request: {
                            type: 'GET',
                            description: 'Retorna todos os produtos',
                            url: process.env.URL_API + 'products/'
                        }
                    }
                }
                return res.status(200).send(response)
            }
        )
    });
}

exports.updateProduct = (req, res, next) => {
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
                            url: process.env.URL_API + 'products/' + req.body.product_id
                        }
                    }
                }
                res.status(202).send(response);
            }
        )
    });
}

exports.deleteProduct = (req, res, next) => {
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
                        url: process.env.URL_API + 'products/',
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
}