const router = require('express').Router();
const { getDashboard, getPnL, getPerformance } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getDashboard);
router.get('/pnl', getPnL);
router.get('/performance', getPerformance);

module.exports = router;
