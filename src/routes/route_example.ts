import express from 'express';
import { getUserById } from '../controllers/controller_example';

const example_router = express.Router();

// Define the routes
example_router.get('/', getUserById);



export default example_router;