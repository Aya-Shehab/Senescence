import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  loginUser,
  updateUser,
  toggleUserStatus
} from "../controllers/user.js";

const router = express.Router();

router.post("/sign-up", createUser);
router.post("/login", loginUser);
router.get("/logout", (req,res) => {
  try {
    res.clearCookie("token");
    return res.redirect("/");
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.patch("/:id/toggle-status", toggleUserStatus);
router.delete("/:id", deleteUser);

export default router;
