import { Router } from 'express';
import { vendas } from '../controllers/relatorioController.js';

const router = Router();
router.get('/vendas', vendas);

export default router;