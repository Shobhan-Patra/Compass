import { Router } from 'express';
import {
  createPost,
  editPost,
  deletePost,
  readPost,
  getAllPostsOfAUser,
} from '../controllers/post.ts';

const router: Router = Router();

router.post('/', createPost);
router.get('/:postId', readPost);
router.patch('/:postId', editPost);
router.delete('/:postId', deletePost);
router.get('/user/:userId', getAllPostsOfAUser);

export default router;
