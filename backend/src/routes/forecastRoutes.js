import express from 'express';
import { getProductForecastAndHistory, generateForecast } from '../controllers/forecastController.js';

const router = express.Router();

router.route('/generate')
  .post(generateForecast);

router.route('/:productId')
  .get(getProductForecastAndHistory);

export default router;
