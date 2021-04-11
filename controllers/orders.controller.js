const mysql = require('../config/mysql');

exports.gerOrders = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT o.order_id, p.product_id, p.name, p.price, o.quantity, (quantity*price) as total FROM orders o INNER JOIN products p ON p.product_id = o.product_id");
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
                        url: process.env.URL_API + 'orders/' + order.order_id
                    }
                }
            })
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

exports.postOrder = async (req, res, next) => {
    try {
        let result = await mysql.execute("SELECT * FROM products WHERE product_id = ?", [req.body.product_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'Product ID not found!' });
        }
        result = await mysql.execute("INSERT INTO orders (product_id, quantity) VALUES (?, ?)", [req.body.product_id, req.body.quantity]);
        const response = {
            message: 'Order created!',
            order: {
                order_id: result.insertId,
                product_id: req.body.product_id,
                quantity: req.body.quantity,
                request: {
                    type: 'GET',
                    description: 'Retorna todos os pedidos',
                    url: process.env.URL_API + 'orders/'
                }
            }
        }
        res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

exports.getOrderById = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM orders WHERE order_id = ?", [req.params.order_id]);
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
                    url: process.env.URL_API + 'orders/'
                }
            }
        }
        return res.status(200).send(response)
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

exports.deleteOrder = async (req, res, next) => {
    try {
        await mysql.execute("DELETE FROM orders WHERE order_id = ?", [req.body.order_id]);
        const response = {
            message: 'Order deleted!',
            request: {
                type: 'POST',
                description: 'Insere um pedido',
                url: process.env.URL_API + 'orders/',
                body: {
                    product_id: 'Number',
                    quantity: 'Number'
                }
            }
        }
        res.status(202).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}