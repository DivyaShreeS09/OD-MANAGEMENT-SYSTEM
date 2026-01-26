const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    registration_number: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    program: { type: String, required: true },
    section: { type: String, required: true },
    email: { type: String, required: true },
    PASSWORD: { type: String, required: true }, // for now
    ROLE: { type: String, default: "student" }
  },
  { collection: "students" } //collection name in Atlas
);

module.exports = mongoose.model("Student", studentSchema);
