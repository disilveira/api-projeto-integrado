const mysql = require('../config/mysql');
const sendEmail = require('../utils/email/sendEmail');
const dateFormat = require('dateformat');
const crypto = require('crypto');
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

exports.getUserProfileImage = async (req, res, next) => {
    try {
        let result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.params.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' })
        }
        result = await mysql.execute("SELECT profile_image FROM users WHERE user_id = ?", [req.params.user_id]);
        const response = {
            image: {
                name: result[0].profile_image,
                url: process.env.URL_API + 'uploads/profile/' + result[0].profile_image,
            }
        }
        res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.requestPasswordReset = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users WHERE email = ?", [req.body.email]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'E-mail not found!' })
        }
        let resetToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt.hash(resetToken, 10);
        const dt = new Date();
        let tokenValidity = dt.setHours(dt.getHours() + 1);
        tokenValidity = dateFormat(tokenValidity, "yyyy-mm-dd HH:MM:ss")
        await mysql.execute("UPDATE users SET token = ?, token_validity = ? WHERE user_id = ?", [tokenHash, tokenValidity, result[0].user_id]);

        const link = `${process.env.URL_API}users/passwordReset/?token=${resetToken}&id=${result[0].user_id}`;

        await sendEmail(
            result[0].email,
            "Password Reset Request",
            `Olá, ${result[0].name}\n\nClique no link abaixo para alterar sua senha\n\nLink: ${link}\n\nEste link estará disponível somente por 1 hora após a solicitação de recuperação de senha`
        );

        const response = {
            success: true,
            message: "E-mail sent!",
            token_validity: tokenValidity
        }
        res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};