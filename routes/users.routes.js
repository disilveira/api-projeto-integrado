const express = require('express');
const router = express.Router();
const mysql = require('../config/mysql').pool;
const bcrypt = require('bcrypt');

router.post('/signup', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }

        conn.query('SELECT * FROM users WHERE email = ?', [req.body.email], (error, result) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (result.length > 0) {
                return res.status(409).send({ message: 'E-mail já cadastrado.' })
            }

            bcrypt.hash(req.body.password, 10, (errorBcrypt, hash) => {
                if (errorBcrypt) { return res.status(500).send({ error: errorBcrypt }) }
                conn.query(
                    `INSERT INTO users (name, email, password) VALUES (?,?,?)`,
                    [req.body.name, req.body.email, hash],
                    (error, result) => {
                        conn.release();
                        if (error) { return res.status(500).send({ error: error }) }
                        const response = {
                            message: 'User created!',
                            user: {
                                user_id: result.insertId,
                                name: req.body.name,
                                email: req.body.email
                            }
                        }
                        return res.status(201).send(response)
                    })
            });
        })
    });
})

module.exports = router;