import { Router } from 'express';
import { getCurrentUserPosts, getUserProfile, syncUser } from '../controllers/user.ts';

const router: Router = Router();

router.post('/sync', syncUser);
router.get('/profile', getUserProfile);
router.get('/posts', getCurrentUserPosts);

export default router;
