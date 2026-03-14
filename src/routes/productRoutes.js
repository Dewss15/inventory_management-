const router = require('express').Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/',  productController.createProduct);
router.get('/',   productController.getProducts);

module.exports = router;
