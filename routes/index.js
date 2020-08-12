import express from 'express';
import cityRouter from './city';
import jwtRouter from './jwt'

var router = express.Router();

/* GET home page. */
router.use('/city', cityRouter);
router.use('/jwt', jwtRouter);

export default router;
