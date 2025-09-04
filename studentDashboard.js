// studentDashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_5VAOdYZURw0VhkQkrNgiibOvj1KfWZQ",
  authDomain: "helloguru-9332d.firebaseapp.com",
  projectId: "helloguru-9332d",
  storageBucket: "helloguru-9332d.appspot.com",
  messagingSenderId: "572020616156",
  appId: "1:572020616156:web:0bd60553416d5a2edfbd19",
  measurementId: "G-KZ7D0DBSE2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const searchBtn = document.getElementById("searchBtn");
const tutorList = document.getElementById("tutorList");

searchBtn.addEventListener("click", async () => {
  const subject = document.getElementById("subjectInput").value.trim().toLowerCase();
  const location = document.getElementById("locationInput").value.trim().toLowerCase();
  const minPrice = parseFloat(document.getElementById("minPriceInput").value);
  const maxPrice = parseFloat(document.getElementById("maxPriceInput").value);

  tutorList.innerHTML = "Loading...";

  console.log("🔍 Search filters:", { subject, location, minPrice, maxPrice });

  try {
    const querySnapshot = await getDocs(collection(db, "tutors"));
    console.log("📂 Tutors found in Firestore:", querySnapshot.size);

    const tutors = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log("👤 Tutor raw data:", data);

      // Normalize subjects for searching
      const subjectsField = Array.isArray(data.subjects)
        ? data.subjects.join(", ").toLowerCase()
        : (data.subjects || "").toLowerCase();

      const matchSubject = !subject || subjectsField.includes(subject);
      const matchLocation = !location || (data.location || "").toLowerCase().includes(location);
      const matchPrice =
        (!minPrice || data.price >= minPrice) &&
        (!maxPrice || data.price <= maxPrice);

      console.log("✅ Matches:", {
        name: data.name,
        matchSubject,
        matchLocation,
        matchPrice
      });

      if (matchSubject && matchLocation && matchPrice) {
        tutors.push(data);
      }
    });

    displayTutors(tutors);
  } catch (err) {
    console.error("🔥 Error fetching tutors:", err);
    tutorList.innerHTML = "<p>Error loading tutors. Check console logs.</p>";
  }
});

function displayTutors(tutors) {
  tutorList.innerHTML = "";

  if (tutors.length === 0) {
    tutorList.innerHTML = "<p>No tutors found. Try adjusting your search criteria.</p>";
    return;
  }

  tutors.forEach((tutor) => {
    const subjectsDisplay = Array.isArray(tutor.subjects)
      ? tutor.subjects.join(", ")
      : tutor.subjects || "Not specified";

    const card = document.createElement("div");
    card.className = "tutor-card";
    card.style.background = "#2d2d44";
    card.style.color = "white";
    card.style.padding = "15px";
    card.style.margin = "10px 0";
    card.style.borderRadius = "8px";

    card.innerHTML = `
      <h4>${tutor.name || "Unnamed Tutor"}</h4>
      <p><strong>Email:</strong> ${tutor.email || "N/A"}</p>
      <p><strong>Subjects:</strong> ${subjectsDisplay}</p>
      <p><strong>Rate:</strong> $${tutor.price || "N/A"}/hr</p>
      <p><strong>Experience:</strong> ${tutor.experience || "N/A"}</p>
      <p><strong>Location:</strong> ${tutor.location || "N/A"}</p>
      <p><strong>Teaching:</strong> ${tutor.mode || "N/A"}</p>
      <button class="bookBtn">📅 Book</button>
      <button class="messageBtn">✉️ Message</button>
    `;

    // Book button (for now just alerts)
    card.querySelector(".bookBtn").addEventListener("click", () => {
      alert(`Booking request sent to ${tutor.name || "this tutor"} (${tutor.email || "no email"})`);
      // 🔮 Later: save to Firestore "appointments"
    });

    // Message button (opens email client)
    card.querySelector(".messageBtn").addEventListener("click", () => {
      if (tutor.email) {
        window.location.href = `mailto:${tutor.email}?subject=Tutoring Inquiry&body=Hi ${tutor.name || "Tutor"}, I’d like to learn more about your tutoring.`;
      } else {
        alert("No email available for this tutor.");
      }
    });

    tutorList.appendChild(card);
  });

  console.log("🎉 Displayed tutors with email + actions:", tutors);
}
