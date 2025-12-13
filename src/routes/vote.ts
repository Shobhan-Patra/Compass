import { Router } from 'express';
import {
  // getAllVotesOfPost,
  removeVote,
  votePost,
} from '../controllers/vote.ts';

const router: Router = Router();

// router.get('/:postId', getAllVotesOfPost);
router.post('/:postId', votePost);
router.delete('/:postId', removeVote);

export default router;
