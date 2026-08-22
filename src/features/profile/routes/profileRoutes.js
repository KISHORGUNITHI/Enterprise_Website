import express from "express";
import jwtAuthenticate from "../../../middleware/jwtmiddleware.js";
import { ProfileController } from "../controllers/profileController.js";

const router = express.Router();
const profileController = new ProfileController();

router.get('/profile', jwtAuthenticate, profileController.getProfile.bind(profileController));
router.post('/profile', jwtAuthenticate, profileController.updateProfile.bind(profileController));

export default router;