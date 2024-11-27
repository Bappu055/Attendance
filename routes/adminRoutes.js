const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", protect(["Admin"]), async (req, res) => {
    const { role, name, date } = req.query;
    try {
        const filter = {};

        if (role) {
            filter.role = role;
        }

        
        if (name) {
            filter.name = new RegExp(name, "i");
        }

        
        if (date) {
            const startOfDay = new Date(date).setHours(0, 0, 0, 0);
            const endOfDay = new Date(date).setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const users = await User.find(filter).select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch("/users/:id/restrict", protect(["Admin"]), async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User access updated", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch("/change-password", protect(["Admin"]), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const admin = await User.findById(req.user.id);

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        admin.password = newPassword;
        await admin.save();
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
