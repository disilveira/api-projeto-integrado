const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        message: 'Order GET Route OK!'
    });
});

router.post('/', (req, res, next) => {
    res.status(201).send({
        message: 'Order POST Route Ok!'
    });
});

router.get('/:order_id', (req, res, next) => {
    const id = req.params.product_id

    if(id == 1){
        res.status(401).send({
            message: 'Unauthorized!'
        });
    }

    res.status(200).send({
        message: 'Order ID GET Route',
        id: id
    });
});

router.patch('/:product_id', (req, res, next) => {
    res.status(201).send({
        message: 'Products PATCH Route Ok!'
    });
});

router.delete('/:product_id', (req, res, next) => {
    res.status(201).send({
        message: 'Products DELETE Route Ok!'
    });
});

module.exports = router;