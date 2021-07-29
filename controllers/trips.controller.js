const mysql = require('../config/mysql');

exports.getTripsData = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT DATE_FORMAT(tripDate, '%d/%m/%y') as date, SUM(tripKm) as tripKm, ROUND((SUM(tripTime)/60),2) as tripTime FROM trip_data WHERE tripDate BETWEEN ? AND ? GROUP BY date", [req.query.startDate, req.query.endDate]);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

exports.getTripsDataNumbers = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT COUNT(DISTINCT licensePlate) as totalVehicles, SUM(tripKm) as totalTripKm, ROUND((SUM(tripTime)/60),2) as totalTripTime, ROUND((SUM(tripTime)/COUNT(id_trip))/60,2) as tripAverageTime FROM trip_data");
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

exports.getVehicleTopNumbers = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT licensePlate, SUM(tripKm) as tripKm, ROUND((SUM(tripTime)/60),2) as tripTime FROM trip_data WHERE tripDate BETWEEN ? AND ? GROUP BY licensePlate LIMIT 10", [req.query.startDate, req.query.endDate]);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};