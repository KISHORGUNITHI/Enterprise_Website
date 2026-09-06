import express from "express";
import jwtAuthenticate from "../../../middleware/jwtmiddleware.js";
import { ProfileController } from "../controllers/profileController.js";

const router = express.Router();
const profileController = new ProfileController();

router.get('/profile', jwtAuthenticate, profileController.getProfile.bind(profileController));
router.post('/profile', jwtAuthenticate, profileController.updateProfile.bind(profileController));
router.post('/profile/address', jwtAuthenticate, profileController.address.bind(profileController));
router.get('/profile/addresses', jwtAuthenticate, profileController.getAddresses.bind(profileController));
router.patch('/profile/address/:id',jwtAuthenticate,profileController.updateAdress.bind(profileController))
router.delete('/profile/address/:id', jwtAuthenticate, profileController.deleteAddress.bind(profileController));

export default router;