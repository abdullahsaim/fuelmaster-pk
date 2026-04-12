const router = require('express').Router();
const { register, login, getMe, addUser, getUsers, updateUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenant');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// User management (tenant-scoped)
router.route('/users')
  .get(protect, tenantScope, authorize('owner', 'manager', 'superadmin'), getUsers)
  .post(protect, tenantScope, authorize('owner', 'manager', 'superadmin'), addUser);
router.put('/users/:id', protect, tenantScope, authorize('owner', 'superadmin'), updateUser);

module.exports = router;
