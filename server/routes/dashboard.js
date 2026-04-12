const router = require('express').Router();
const { getDashboard, getPnL, getPerformance } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenant');

router.use(protect);
router.use(tenantScope);

router.get('/', getDashboard);
router.get('/pnl', getPnL);
router.get('/performance', getPerformance);

module.exports = router;
