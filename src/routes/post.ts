import { Router } from 'express';
import { createPost, editPost, deletePost, getUserPosts } from '../controllers/post.ts';

const router: Router = Router();

router.get('/', getUserPosts);
router.post('/', createPost);
router.patch('/:postId', editPost);
router.delete('/:postId', deletePost);

export default router;
