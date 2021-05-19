const mysql = require('../config/mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    try {
        let result = await mysql.execute("SELECT * FROM users WHERE email = ?", [req.body.email]);
        if (result.length > 0) {
            return res.status(409).send({ message: 'E-mail já cadastrado.' })
        }
        bcrypt.hash(req.body.password, 10, async (errorBcrypt, hash) => {
            if (errorBcrypt) { return res.status(500).send({ error: errorBcrypt }) }
            result = await mysql.execute("INSERT INTO users (name, email, password) VALUES (?,?,?)", [req.body.name, req.body.email, hash]);
            const response = {
                message: 'User created!',
                user: {
                    user_id: result.insertId,
                    name: req.body.name,
                    email: req.body.email
                }
            }
            return res.status(201).send(response)
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.signin = async (req, res, next) => {
    try {
        const response = await mysql.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", [req.body.email]);
        if (response.length == 0) {
            return res.status(401).send({ message: 'Unauthorized!' })
        }
        bcrypt.compare(req.body.password, response[0].password, (error, result) => {
            if (error) {
                return res.status(401).send({ message: 'Unauthorized!' });
            }

            if (result) {
                const token = jwt.sign({
                    user_id: response[0].user_id,
                    is_admin: response[0].is_admin,
                    email: response[0].email
                },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "8h"
                    });
                return res.status(200).send({
                    message: 'Authenticated!',
                    user_id: response[0].user_id,
                    email: response[0].email,
                    user_name: response[0].name,
                    token: token
                });
            }

            return res.status(401).send({ message: 'Unauthorized!' });

        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}