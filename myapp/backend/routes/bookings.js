// Read and write bookings using the provided JSON store helpers.
const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/jsonStore");

router.get("/", (req, res) => {
  res.json(readData("bookings.json"));
});

router.post("/", (req, res) => {
  const body = req.body || {};
  const required = ["roomId", "clubName", "date", "startTime", "endTime"];
  if (required.some(field => typeof body[field] !== "string" || !body[field].trim())) {
    return res.status(400).json({ error: "Room, club name, date, start time, and end time are required." });
  }
  const { roomId, date, startTime, endTime } = body;
  if (!readData("rooms.json").some(room => room.id === roomId)) {
    return res.status(400).json({ error: "Please select an existing room." });
  }
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ error: "Please enter a valid date." });
  }
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(startTime) || !timePattern.test(endTime) || endTime <= startTime) {
    return res.status(400).json({ error: "Enter valid times with end time after start time." });
  }
  if (body.purpose !== undefined && typeof body.purpose !== "string") {
    return res.status(400).json({ error: "Purpose must be text." });
  }
  const bookings = readData("bookings.json");
  if (bookings.some(booking => booking.roomId === roomId && booking.date === date && startTime < booking.endTime && endTime > booking.startTime)) {
    return res.status(409).json({ error: "This room is already booked during that time. Please choose another time or room." });
  }
  // Keep the timestamp ID format from the assignment, even for rapid requests.
  let id = Date.now();
  while (bookings.some(booking => booking.id === String(id))) id++;
  const booking = {
    id: String(id), roomId, clubName: body.clubName.trim(), date,
    startTime, endTime, purpose: (body.purpose || "").trim(),
  };
  bookings.push(booking);
  writeData("bookings.json", bookings);
  res.status(201).json(booking);
});

router.delete("/:id", (req, res) => {
  const bookings = readData("bookings.json");
  const remaining = bookings.filter(booking => booking.id !== req.params.id);
  if (remaining.length === bookings.length) {
    return res.status(404).json({ error: "Booking not found" });
  }
  writeData("bookings.json", remaining);
  res.json({ message: "Booking canceled" });
});

module.exports = router;
