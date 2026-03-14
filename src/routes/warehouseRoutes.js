const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const warehouseController = require('../controllers/warehouseController');

router.use(authMiddleware);

router.post('/', warehouseController.createWarehouse);
router.get('/',  warehouseController.getAllWarehouses);

module.exports = router;
