// Use textContent for booking fields so entered text is never treated as HTML.
async function renderBookings() {
  const container = document.getElementById("bookings-list");
  try {
    const [bookings, rooms] = await Promise.all([getBookings(), getRooms()]);
    container.replaceChildren();
    if (!bookings.length) {
      container.textContent = "No bookings yet. Visit Book a Room to reserve a space.";
      return;
    }
    for (const booking of bookings) {
      const item = document.createElement("div");
      item.className = "booking-item";
      const details = document.createElement("div");
      const title = document.createElement("h2");
      const room = rooms.find(room => room.id === booking.roomId);
      title.textContent = room ? room.name : booking.roomId;
      details.appendChild(title);
      for (const text of [booking.clubName, `${booking.date} · ${booking.startTime}–${booking.endTime}`, booking.purpose]) {
        if (!text) continue;
        const line = document.createElement("p");
        line.textContent = text;
        details.appendChild(line);
      }
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Cancel";
      button.dataset.id = booking.id;
      button.setAttribute("aria-label", `Cancel ${booking.clubName} booking on ${booking.date}`);
      button.addEventListener("click", () => handleCancelClick(booking.id, button));
      item.append(details, button);
      container.appendChild(item);
    }
  } catch (error) {
    container.textContent = `Could not load bookings: ${error.message}`;
  }
}

async function handleCancelClick(bookingId, button) {
  const status = document.getElementById("bookings-status");
  button.disabled = true;
  try {
    await deleteBooking(bookingId);
    status.className = "status-message success";
    status.textContent = "Booking canceled.";
    await renderBookings();
  } catch (error) {
    status.className = "status-message error";
    status.textContent = error.message;
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", renderBookings);
