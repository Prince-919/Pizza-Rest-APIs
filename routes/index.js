import express from "express";
import {
  registerController,
  loginController,
  userController,
  refreshController,
  productsController,
} from "../controllers";
import auth from "../middlewares/auth";
import admin from "../middlewares/admin";
const router = express.Router();

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.get("/me", auth, userController.me);
router.post("/refresh", refreshController.refresh);
router.post("/logout", auth, loginController.logout);

// products
router.post("/products", [auth, admin], productsController.store);
router.put("/products/:id", [auth, admin], productsController.update);
router.delete("/products/:id", [auth, admin], productsController.destroy);
router.get("/products", productsController.index);
router.get("/products/:id", productsController.show);

export default router;
