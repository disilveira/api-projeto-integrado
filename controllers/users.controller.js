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