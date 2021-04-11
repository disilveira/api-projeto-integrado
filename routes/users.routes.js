const express = require('express');
const router = express.Router();

const multer = require('multer');
const crypto = require('crypto');
var path = require('path');

const { verifyLogin, isAdmin } = require('../middleware/auth.middleware');
const usersController = require('../controllers/users.controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/profile/');
    },
    filename: function (req, file, cb) {
        cb(null, crypto.createHash('md5').update(new Date().getTime() + file.originalname).digest("hex") + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 3
    }
});

router.get(
    '/',
    verifyLogin,
    isAdmin,
    usersController.getUsers
);

router.get(
    '/:user_id',
    verifyLogin,
    isAdmin,
    usersController.getUserById
);

router.patch(
    '/',
    verifyLogin,
    isAdmin,
    usersController.updateUser
);

router.delete(
    '/',
    verifyLogin,
    isAdmin,
    usersController.deleteUser
);

router.patch(
    '/:user_id/image',
    verifyLogin,
    upload.single('profile_image'),
    usersController.insertProfileImage
);

module.exports = router;