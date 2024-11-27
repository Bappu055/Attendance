const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    time: { type: String, required: true },
    selfie: { type: String, required: true },
});
//
module.exports = mongoose.model("Attendance", AttendanceSchema);
