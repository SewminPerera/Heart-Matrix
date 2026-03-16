const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe, submitGameResult, rerollAvatar } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.post('/game/result', auth, submitGameResult);
router.post('/profile/avatar/reroll', auth, rerollAvatar); 

module.exports = router;
