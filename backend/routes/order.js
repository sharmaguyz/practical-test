const express = require('express');
const router = express.Router();
const orderController = require('.././controllers/user/orderController');
const { userCheckAuth } = require('../middlewares/userMiddleware');
const bodyParser = require('body-parser');

router.post('/place-order',userCheckAuth,orderController.placeOrder);
router.get('/placed-order',userCheckAuth,orderController.getPlacedCourses);

module.exports = router;