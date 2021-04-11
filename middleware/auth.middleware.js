const jwt = require('jsonwebtoken');

const verifyLogin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_KEY);
        req.usuario = decode;
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Unauthorized!' });
    }
}

const isAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_KEY);
        req.usuario = decode;
        if(req.usuario.is_admin == 0){
            return res.status(401).send({ message: 'Unauthorized! Admin Role Required!' });
        }
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Unauthorized!' });
    }
}

const auth = {
    verifyLogin: verifyLogin,
    isAdmin: isAdmin
}

module.exports = auth;