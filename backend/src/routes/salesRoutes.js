import express from 'express';
import { getSales, createSale, getSalesStats } from '../controllers/salesController.js';

const router = express.Router();

router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/stats')
  .get(getSalesStats);

export default router;
