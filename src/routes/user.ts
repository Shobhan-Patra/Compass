import { Router } from 'express';
import { getUserProfile, syncUser } from '../controllers/user.ts';

const router: Router = Router();

router.post('/sync', syncUser);
router.get('/profile', getUserProfile);

export default router;
