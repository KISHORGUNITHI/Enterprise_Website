import express from "express"
import { AuthController } from "../controllers/authcontroller.js";

const router         = express.Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login',    authController.login.bind(authController));
router.post('/logout',   authController.logout.bind(authController));

router.get('/login', (req, res) => {
    res.render("pages/auth/auth");
});


export default router;