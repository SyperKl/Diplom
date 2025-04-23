// routes/auth.js
import { Router } from 'express';
const router = Router();
import { register, login } from '../controllers/auth';

router.post('/register', register);
router.post('/login', login);

// eslint-disable-next-line no-undef
module.exports = router;
