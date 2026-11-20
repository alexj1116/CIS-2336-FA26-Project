// All requests to the Express backend stay in this file.
async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed. Please try again.");
  return data;
}

async function getRooms() { return apiRequest("/api/rooms"); }
async function getRoomById(id) { return apiRequest(`/api/rooms/${encodeURIComponent(id)}`); }
async function getBookings() { return apiRequest("/api/bookings"); }
async function createBooking(bookingData) {
  return apiRequest("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
}
async function deleteBooking(id) {
  return apiRequest(`/api/bookings/${encodeURIComponent(id)}`, { method: "DELETE" });
}
