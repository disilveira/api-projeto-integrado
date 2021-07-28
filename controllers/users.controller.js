const mysql = require('../config/mysql');
const sendEmail = require('../utils/email/sendEmail');
const dateFormat = require('dateformat');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users");
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.params.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' });
        }
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
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
        return res.status(500).send({ error: error.message });
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.params.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' })
        }
        await mysql.execute("DELETE FROM users WHERE user_id = ?", [req.params.user_id]);
        const response = {
            message: 'User deleted!',
        }
        res.status(202).send(response);
    } catch (error) {
        return res.status(500).send({ error: error.message });
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
        return res.status(500).send({ error: error.message });
    }
};

exports.getUserProfileImage = async (req, res, next) => {
    try {
        let result = await mysql.execute("SELECT * FROM users WHERE user_id = ?", [req.params.user_id]);
        if (result.length == 0) {
            return res.status(404).send({ message: 'User ID not found!' })
        }
        result = await mysql.execute("SELECT profile_image FROM users WHERE user_id = ?", [req.params.user_id]);
        res.status(201).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
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

        let response = {};

        try {
            let emailResult = await sendEmail(
                result[0].email,
                "Password Reset Request",
                `Olá, ${result[0].name}\n\nClique no link abaixo para alterar sua senha\n\nLink: ${link}\n\nEste link estará disponível somente por 1 hora após a solicitação de recuperação de senha`
            );
            response = {
                success: true,
                response: emailResult.response,
                messageId: emailResult.messageId,
                token_validity: tokenValidity
            }
        } catch (error) {
            response = {
                success: false,
                error: error.message
            }
        }
    
        res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

exports.passwordReset = async (req, res, next) => {
    try {
        const data = await mysql.execute("SELECT * FROM users WHERE email = ? AND user_id = ?", [req.body.email, req.query.id]);
        if (data.length == 0) {
            return res.status(404).send({ success: false, message: 'User not found!' });
        }

        bcrypt.compare(req.query.token, data[0].token, async (error, result) => {

            if (error) {
                return res.status(401).send({ success: false, message: error.message });
            }

            if(new Date().getTime() > new Date(data[0].token_validity).getTime()){
                return res.status(401).send({ success: false, message: "Token expired!" });
            }

            if (result) {

                bcrypt.hash(req.body.password, 10, async (errorBcrypt, hash) => {
                    if (errorBcrypt) { return res.status(500).send({ error: errorBcrypt }) }
                    const atualDate = new Date();
                    await mysql.execute("UPDATE users SET password = ?, token = 0, token_validity = ? WHERE user_id = ? AND email = ?", [hash, atualDate, data[0].user_id, data[0].email]);

                    await sendEmail(
                        data[0].email,
                        "Password Changed",
                        `Olá, ${data[0].name}\n\nInformamos que sua senha foi alterada com sucesso!`
                    );

                    const response = {
                        success: true,
                        message: "Password changed!"
                    }
                    return res.status(200).send(response);
                });

            } else {
                return res.status(401).send({ success: false, message: 'Inválid Token!' });
            }

        });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};