// ======================================
// Event Management Portal
// ======================================

let events = JSON.parse(localStorage.getItem("events")) || [];
let editIndex = -1;

// DOM Elements
const eventContainer = document.getElementById("eventContainer");
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const eventName = document.getElementById("eventName");
const description = document.getElementById("description");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const venue = document.getElementById("venue");
const category = document.getElementById("category");
const organizer = document.getElementById("organizer");
const capacity = document.getElementById("capacity");
const registered = document.getElementById("registered");

const totalEvents = document.getElementById("totalEvents");
const upcomingEvents = document.getElementById("upcomingEvents");
const completedEvents = document.getElementById("completedEvents");

const search = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");
const sortBtn = document.getElementById("sortBtn");

let sortAscending = true;

// ======================================
// Helpers
// ======================================

function saveToLocalStorage() {
    localStorage.setItem("events", JSON.stringify(events));
}

function clearForm() {
    [eventName, description, eventDate, eventTime, venue, organizer, capacity, registered].forEach(el => el.value = "");
    category.value = "Conference";
    editIndex = -1;
}

function openPopup(title = "Add Event") {
    popup.style.display = "flex";
    popupTitle.textContent = title;
}

function closePopup() {
    popup.style.display = "none";
    clearForm();
}

// ======================================
// Dashboard
// ======================================

function updateDashboard() {
    totalEvents.textContent = events.length;
    const now = new Date();
    
    const upcoming = events.filter(e => new Date(e.date + "T" + e.time) > now).length;
    upcomingEvents.textContent = upcoming;
    completedEvents.textContent = events.length - upcoming;
}

// ======================================
// Core Logic (Add/Edit/Delete)
// ======================================

function saveEvent() {
    if (!eventName.value.trim() || !eventDate.value || !eventTime.value || !venue.value.trim() || !organizer.value.trim()) {
        alert("Please fill all required fields.");
        return;
    }

    const eventData = {
        name: eventName.value,
        description: description.value,
        date: eventDate.value,
        time: eventTime.value,
        venue: venue.value,
        category: category.value,
        organizer: organizer.value,
        capacity: Number(capacity.value),
        registered: Number(registered.value)
    };

    if (editIndex === -1) events.push(eventData);
    else events[editIndex] = eventData;

    saveToLocalStorage();
    applyFilters(); // Re-render and refresh filters
    updateDashboard();
    closePopup();
}

function deleteEvent(index) {
    if (confirm("Delete this event?")) {
        events.splice(index, 1);
        saveToLocalStorage();
        applyFilters();
        updateDashboard();
    }
}

function editEvent(index) {
    editIndex = index;
    const event = events[index];
    eventName.value = event.name;
    description.value = event.description;
    eventDate.value = event.date;
    eventTime.value = event.time;
    venue.value = event.venue;
    category.value = event.category;
    organizer.value = event.organizer;
    capacity.value = event.capacity;
    registered.value = event.registered;
    openPopup("Edit Event");
}

// ======================================
// UI Rendering & Filtering
// ======================================

function getStatus(event) {
    const eventDateTime = new Date(event.date + "T" + event.time);
    const now = new Date();
    if (eventDateTime > now) return { text: "Upcoming", className: "upcoming" };
    return { text: "Completed", className: "completed" };
}

function getCountdown(event) {
    const diff = new Date(event.date + "T" + event.time) - new Date();
    if (diff <= 0) return "Event Started / Completed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `Starts in ${days}d ${hours}h`;
}

function displayEvents(list = events) {
    eventContainer.innerHTML = "";
    if (list.length === 0) {
        eventContainer.innerHTML = `<h3 style="grid-column:1/-1;text-align:center;">No Events Found</h3>`;
        return;
    }

    list.forEach((event) => {
        // Find original index to ensure edit/delete works even when filtered
        const originalIndex = events.indexOf(event);
        const status = getStatus(event);
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="top">
                <h3>${event.name}</h3>
                <span class="status ${status.className}">${status.text}</span>
            </div>
            <p>${event.description}</p>
            <p>📅 ${event.date} | 🕒 ${event.time}</p>
            <p>📍 ${event.venue} | 📂 ${event.category}</p>
            <p>👤 ${event.organizer}</p>
            <p>👥 ${event.registered}/${event.capacity} Registered</p>
            <p class="countdown">⏳ ${getCountdown(event)}</p>
            <div class="actions">
                <button onclick="editEvent(${originalIndex})">Edit</button>
                <button onclick="deleteEvent(${originalIndex})">Delete</button>
            </div>
        `;
        eventContainer.appendChild(card);
    });
}

function applyFilters() {
    const keyword = search.value.toLowerCase();
    const cat = filterCategory.value;
    const filtered = events.filter(e => 
        (e.name.toLowerCase().includes(keyword) || e.venue.toLowerCase().includes(keyword)) && 
        (cat === "All" || e.category === cat)
    );
    displayEvents(filtered);
}

// ======================================
// Initialization & Listeners
// ======================================

search.addEventListener("keyup", applyFilters);
filterCategory.addEventListener("change", applyFilters);
document.getElementById("addBtn").addEventListener("click", () => { clearForm(); openPopup(); });
document.getElementById("saveBtn").addEventListener("click", saveEvent);
document.getElementById("cancelBtn").addEventListener("click", closePopup);

// Validations
[capacity, registered].forEach(el => {
    el.addEventListener("input", () => {
        if (el.value < 0) el.value = 0;
        if (Number(registered.value) > Number(capacity.value)) {
            alert("Registered cannot exceed capacity.");
            registered.value = capacity.value;
        }
    });
});

// Sorting
sortBtn.addEventListener("click", () => {
    events.sort((a, b) => sortAscending ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
    sortAscending = !sortAscending;
    saveToLocalStorage();
    applyFilters();
});

// Initial Load
updateDashboard();
displayEvents();