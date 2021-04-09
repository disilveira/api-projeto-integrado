const express = require('express');
const router = express.Router();

const multer = require('multer');
const crypto = require('crypto');
var path = require('path');

const productsController = require('../controllers/products.controller');
const verifyLogin = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
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

router.get('/', productsController.getProducts);

router.post('/', 
    verifyLogin, 
    upload.single('product_image'), 
    productsController.postProduct
);

router.get('/:product_id', productsController.getProductById);

router.patch('/', 
    verifyLogin, 
    productsController.updateProduct
);

router.delete('/', 
    verifyLogin, 
    productsController.deleteProduct
);

module.exports = router;