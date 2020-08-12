import express from 'express'
import TodoController from '../controller/todo.controller'

const router = express.Router();

router.get('/', TodoController.getAll)

export default router