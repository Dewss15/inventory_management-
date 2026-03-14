const router = require('express').Router();
const receiptController = require('../controllers/receiptController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/',              receiptController.createReceipt);
router.get('/',               receiptController.getReceipts);
router.patch('/:id/status',   receiptController.updateReceiptStatus);

module.exports = router;
