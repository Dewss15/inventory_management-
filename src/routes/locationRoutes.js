const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const locationController = require('../controllers/locationController');

router.use(authMiddleware);

router.post('/', locationController.createLocation);
router.get('/',  locationController.getAllLocations);

module.exports = router;
