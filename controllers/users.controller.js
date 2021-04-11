const mysql = require('../config/mysql');

exports.getUsers = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users");
        const response = {
            rows: result.length,
            users: result.map(user => {
                return {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    is_active: user.is_active,
                    is_admin: user.is_admin,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                }
            })
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.params.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' });
        }
        const response = {
            user: {
                user_id: result[0].user_id,
                name: result[0].name,
                email: result[0].email,
                is_active: result[0].is_active,
                is_admin: result[0].is_admin,
                createdAt: result[0].created_at,
                updatedAt: result[0].updated_at
            }
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};