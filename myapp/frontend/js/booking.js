// Load room options, then save the completed form through api.js.
async function populateRoomSelect() {
  const select = document.getElementById("room-select");
  const button = document.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const rooms = await getRooms();
    for (const room of rooms) {
      const option = document.createElement("option");
      option.value = room.id;
      option.textContent = `${room.name} (${room.capacity} people)`;
      select.appendChild(option);
    }
    button.disabled = rooms.length === 0;
    if (!rooms.length) throw new Error("No rooms are available to book.");
  } catch (error) {
    showFormStatus(error.message, "error");
  }
}

function showFormStatus(message, type) {
  const status = document.getElementById("form-status");
  status.textContent = message;
  status.className = `status-message ${type}`;
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const bookingData = {
    roomId: form.elements.roomId.value,
    clubName: form.elements.clubName.value.trim(),
    date: form.elements.date.value,
    startTime: form.elements.startTime.value,
    endTime: form.elements.endTime.value,
    purpose: form.elements.purpose.value.trim(),
  };
  if (!bookingData.clubName) {
    showFormStatus("Please enter a club name.", "error");
    return;
  }
  if (bookingData.endTime <= bookingData.startTime) {
    showFormStatus("End time must be after start time.", "error");
    return;
  }
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  showFormStatus("Saving booking…", "");
  try {
    await createBooking(bookingData);
    form.reset();
    showFormStatus("Booking saved! View or cancel it on My Bookings.", "success");
  } catch (error) {
    showFormStatus(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateRoomSelect();
  document.getElementById("booking-form").addEventListener("submit", handleBookingSubmit);
});
