const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const orderController = require('.././controllers/user/orderController');

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), orderController.webHook);

module.exports = router;
