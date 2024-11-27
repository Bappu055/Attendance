const express = require("express");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
//

router.get("/attendance", protect(["Teacher"]), async (req, res) => {
    const { date, studentName } = req.query;

    try {
        const filter = {};

       
        if (date) {
            const startOfDay = new Date(date).setHours(0, 0, 0, 0);
            const endOfDay = new Date(date).setHours(23, 59, 59, 999);
            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

       
        if (studentName) {
            const students = await User.find({ name: new RegExp(studentName, "i"), role: "Student" });
            filter.student = { $in: students.map((s) => s._id) };
        }

        const attendanceRecords = await Attendance.find(filter).populate("student", "name email");
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get("/students", protect(["Teacher"]), async (req, res) => {
    try {
        const students = await User.find({ role: "Student" }).select("name email contactInfo");
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get("/student/:id", protect(["Teacher"]), async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select("-password");
        if (!student || student.role !== "Student") {
            return res.status(404).json({ message: "Student not found" });
        }

        const attendanceHistory = await Attendance.find({ student: student._id }).sort({ date: -1 });
        res.status(200).json({ student, attendanceHistory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
