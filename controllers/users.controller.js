const mysql = require('../config/mysql');
const bcrypt = require('bcrypt');

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
                    profile_image: result[0].profile_image,
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
                profile_image: result[0].profile_image,
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

exports.updateUser = async (req, res, next) => {
    try {
        let result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.body.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' })
        }
        result = await mysql.execute("SELECT * FROM users WHERE email = ? AND user_id != ?", [req.body.email, req.body.user_id]);
        if (result.length > 0) {
            return res.status(409).send({ message: 'This email is already being used by another user.' })
        }
        result = await mysql.execute("UPDATE users SET name = ?, email = ?, is_admin = ?, is_active = ? WHERE user_id = ?", [req.body.name, req.body.email, req.body.is_admin, req.body.is_active, req.body.user_id]);
        const response = {
            message: 'User updated!'
        }
        return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.body.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' })
        }
        await mysql.execute("DELETE FROM users WHERE user_id = ?", [req.body.user_id]);
        const response = {
            message: 'User deleted!',
        }
        res.status(202).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.insertProfileImage = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.params.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' })
        }
        await mysql.execute("UPDATE users SET profile_image = ? WHERE user_id = ?", [req.file.filename, req.params.user_id]);
        const response = {
            message: 'Profile image inserted!',
            image: {
                url: process.env.URL_API + 'uploads/profile/' + req.file.filename,
            }
        }
        res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};