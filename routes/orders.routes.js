const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orders.controller');

router.get('/', orderController.gerOrders);
router.post('/', orderController.postOrder);
router.get('/:order_id', orderController.getOrderById);
router.delete('/', orderController.deleteOrder);

module.exports = router;