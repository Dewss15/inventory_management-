const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

router.use(authMiddleware);

router.post('/', productController.createProduct);
router.get('/',  productController.getAllProducts);

module.exports = router;
