const mysql = require('../config/mysql');

exports.getTrips = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM trip_data");
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};