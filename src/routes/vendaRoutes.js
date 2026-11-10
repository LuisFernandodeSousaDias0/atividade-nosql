import { Router } from 'express';
import { registrar, listar, obter } from '../controllers/vendaController.js';

const router = Router();
router.get('/', listar);
router.get('/:id', obter);
router.post('/', registrar);

export default router;