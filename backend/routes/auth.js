const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

router.post("/login", async (req, res) => {
  try {
    const { role, username, password } = req.body;

    if (!role || !username || !password) {
      return res.status(400).json({ message: "role, username, password are required" });
    }

    // STUDENT LOGIN from MongoDB
    if (role === "student") {
      const student = await Student.findOne({ registration_number: username });

      if (!student) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (student.PASSWORD !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.json({
        message: "Login success",
        token: `token-student-${student.registration_number}`, // placeholder for now
        role: "student",
        name: student.name
      });
    }

    // TEMP: staff/admin hardcoded until add collections for them
    if (role === "staff" && username === "10001" && password === "staff123") {
      return res.json({ message: "Login success", token: "token-staff-1", role: "staff", name: "Year Coordinator" });
    }

    if (role === "admin" && username === "90001" && password === "hod123") {
      return res.json({ message: "Login success", token: "token-admin-1", role: "admin", name: "HOD" });
    }

    return res.status(401).json({ message: "Invalid credentials" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
