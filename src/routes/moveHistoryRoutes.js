const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const moveHistoryController = require('../controllers/moveHistoryController');

router.use(authMiddleware);

router.get('/', moveHistoryController.getAllMoveHistory);

module.exports = router;
