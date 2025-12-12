import { Router } from 'express';
import { getUserProfile } from '../controllers/user.ts';

const router: Router = Router();

router.get('/', getUserProfile);

export default router;
