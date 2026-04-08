const router = require('express').Router();
const { getDashboard, getPnL } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getDashboard);
router.get('/pnl', getPnL);

module.exports = router;
