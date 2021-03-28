const express = require('express');
const router = express.Router();
const mysql = require('../config/mysql').pool;

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `SELECT
                o.order_id,  
                p.product_id, 
                p.name, 
                p.price, 
                o.quantity, 
                (quantity*price) as total 
            FROM orders o
            INNER JOIN products p ON p.product_id = o.product_id`,
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    rows: result.length,
                    orders: result.map(order => {
                        return {
                            order_id: order.order_id,
                            product_detail: {
                                product_id: order.product_id,
                                name: order.name,
                                price: order.price
                            },
                            quantity: order.quantity,
                            total: order.total,
                            request: {
                                type: 'GET',
                                description: 'Retorna os detalhes do pedido',
                                url: 'http://localhost:3000/orders/' + order.order_id
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )
    });
});

router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM products WHERE product_id = ?',
            [req.body.product_id],
            (error, result, field) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({ message: 'Product ID not found!' });
                }
                conn.query(
                    'INSERT INTO orders (product_id, quantity) VALUES (?, ?)',
                    [req.body.product_id, req.body.quantity],
                    (error, result, field) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }) }
                        const response = {
                            message: 'Order created!',
                            order: {
                                order_id: result.insertId,
                                product_id: req.body.product_id,
                                quantity: req.body.quantity,
                                request: {
                                    type: 'GET',
                                    description: 'Retorna todos os pedidos',
                                    url: 'http://localhost:3000/orders/'
                                }
                            }
                        }
                        res.status(201).send(response);
                    }
                )

            });
    });

});

router.get('/:order_id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM orders WHERE order_id = ?',
            [req.params.order_id],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }

                if (result.length == 0) {
                    return res.status(404).send({ message: 'Order ID not found!' });
                }

                const response = {
                    order: {
                        order_id: result[0].order_id,
                        product_id: result[0].product_id,
                        quantity: result[0].quantity,
                        request: {
                            type: 'GET',
                            description: 'Retorna todos os pedidos',
                            url: 'http://localhost:3000/orders/'
                        }
                    }
                }
                return res.status(200).send(response)
            }
        )
    });
});

router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM orders WHERE order_id = ?`, [req.body.order_id],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    message: 'Order deleted!',
                    request: {
                        type: 'POST',
                        description: 'Insere um pedido',
                        url: 'http://localhost:3000/orders/',
                        body: {
                            product_id: 'Number',
                            quantity: 'Number'
                        }
                    }
                }
                res.status(202).send(response);
            }
        )
    });
});

module.exports = router;