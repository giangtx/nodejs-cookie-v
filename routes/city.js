import express from 'express';
import CityController from '../controller/city.controller'
import { isAuthorized } from '../auth'

const router = express.Router();
router.get('/', isAuthorized, CityController.getAPI)
// router.get('/name', CityController.getByName)
// router.get('/country', CityController.getByCountry)

export default router