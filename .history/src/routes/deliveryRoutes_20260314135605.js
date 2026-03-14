const router = require('express').Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/',            deliveryController.createDelivery);
router.get('/',             deliveryController.getDeliveries);
router.patch('/:id/status', deliveryController.updateDeliveryStatus);

module.exports = router;
