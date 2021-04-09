const mysql = require('../config/mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
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
}

exports.signin = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM users WHERE email = ?`
        conn.query(query, [req.body.email], (error, row, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (row.length == 0) {
                return res.status(401).send({ message: 'Unauthorized!' })
            }

            bcrypt.compare(req.body.password, row[0].password, (error, result) => {
                if (error) {
                    return res.status(401).send({ message: 'Unauthorized!' });
                }

                if (result) {
                    const token = jwt.sign({
                        user_id: row[0].user_id,
                        is_admin: row[0].is_admin,
                        email: row[0].email
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "8h"
                        });
                    return res.status(200).send({
                        message: 'Authenticated!',
                        token: token
                    });
                }

                return res.status(401).send({ message: 'Unauthorized!' });

            });

        });
    });
}