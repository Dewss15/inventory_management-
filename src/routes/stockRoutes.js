const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const stockController = require('../controllers/stockController');

router.use(authMiddleware);

router.get('/',      stockController.getAllStock);
router.patch('/:id', stockController.updateStock);

module.exports = router;
