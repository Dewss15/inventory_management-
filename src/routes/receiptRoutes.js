const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const receiptController = require('../controllers/receiptController');

router.use(authMiddleware);

router.post('/',              receiptController.createReceipt);
router.get('/',               receiptController.getAllReceipts);
router.get('/:id',            receiptController.getReceiptById);
router.patch('/:id/status',   receiptController.updateStatus);

module.exports = router;
