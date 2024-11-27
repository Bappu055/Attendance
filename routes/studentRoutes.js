const express = require("express");
const multer = require("multer");
const Attendance = require("../models/Attendance");
const protect = require("../middleware/authMiddleware");
const router = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });
//

router.post("/attendance", protect(["Student"]), upload.single("selfie"), async (req, res) => {
    try {
        const { time } = req.body;
        const attendance = new Attendance({
            student: req.user.id,
            time,
            selfie: req.file.path,
        });

        await attendance.save();
        res.status(201).json({ message: "Attendance marked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get("/attendance-history", protect(["Student"]), async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ student: req.user.id }).sort({ date: -1 });
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
