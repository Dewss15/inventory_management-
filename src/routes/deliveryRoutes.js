const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const deliveryController = require('../controllers/deliveryController');

router.use(authMiddleware);

router.post('/',            deliveryController.createDelivery);
router.get('/',             deliveryController.getAllDeliveries);
router.get('/:id',          deliveryController.getDeliveryById);
router.patch('/:id/status', deliveryController.updateStatus);

module.exports = router;
