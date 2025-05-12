const api = "https://localhost:7035/api/"; // API URL
let selectedCoordinates = { latitude: 0, longitude: 0 };

document.addEventListener("DOMContentLoaded", function () {
  // עמוד שלב 1: שומר טלפון וסיסמה ב-localStorage
  const firstSubmitBtn = document.getElementById("firstSubmit");
  if (firstSubmitBtn) {
    firstSubmitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const phone = document.getElementById("phoneNumber")?.value;
      const pass = document.getElementById("password")?.value;

      if (!phone || !pass) {
        alert("יש למלא את כל השדות");
        return;
      }

      localStorage.setItem("phoneNumber", phone);
      localStorage.setItem("password", pass);
      window.location.href = "register-step2.html";
    });
  }

  // עמוד שלב 2: כפתור "הצטרפות"
  const submit2Btn = document.getElementById("submit2");
  if (submit2Btn) {
    submit2Btn.addEventListener("click", registerPerson);
  }

  // עמוד שלב 3: שליחת אירוע
  const finalSubmitBtn = document.getElementById("finalSubmit");
  if (finalSubmitBtn) {
    finalSubmitBtn.addEventListener("click", function (e) {
      e.preventDefault(); // מונע ריענון
      submitFinalStep();
    });
  }
});

// Google Maps API - AutoComplete
function initAutocomplete() {
  const input = document.getElementById("location");
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"],
    componentRestrictions: { country: "il" },
  });

  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      selectedCoordinates.latitude = place.geometry.location.lat();
      selectedCoordinates.longitude = place.geometry.location.lng();
      console.log("📍 Location selected:", selectedCoordinates);
    } else {
      console.warn("⚠️ כתובת לא תקינה או לא נבחרה מרשימה");
    }
  });
}

// עדכון תמונה לפי מגדר
function updateImage(selectId, imgId) {
  const gender = document.getElementById(selectId)?.value;
  const imgElement = document.getElementById(imgId);
  if (!gender || !imgElement) return;

  imgElement.src =
    gender === "M"
      ? "../images/groom.webp"
      : gender === "F"
      ? "../images/bride.webp"
      : "";
}

// שלב 2: יצירת משתמש
function registerPerson() {
  const fullName = document.getElementById("partner1")?.value;
  const password = localStorage.getItem("password");
  const phone = localStorage.getItem("phoneNumber");
  const gender = document.getElementById("gender1")?.value;

  if (!fullName || !password || !phone || !gender) {
    alert("יש למלא את כל השדות לפני ההצטרפות");
    return;
  }

  const newPerson = {
    fullName: fullName,
    password: password,
    phoneNumber: phone,
    smoke: false,
    gender: gender,
  };

  console.log("📋 New Person Data:", newPerson);

  ajaxCall(
    "POST",
    api + "Persons/register",
    JSON.stringify(newPerson),
    function (response) {
      const personID = response;
      console.log("✅ Person ID:", personID);
      localStorage.setItem("personID", personID);
      alert("✅ ההצטרפות הושלמה בהצלחה!");
      window.location.href = "register-step3.html";
    },
    function (error) {
      console.error("❌ Registration failed:", error);
      alert("שגיאה בהרשמה");
    }
  );
}

// שלב 3: יצירת אירוע
function submitFinalStep() {
  const personId = localStorage.getItem("personID");
  console.log("📋 Person ID from localStorage:", personId);
  if (!personId) {
    alert("שגיאה: לא נמצא משתמש מזוהה");
    return;
  }

  const newEvent = {
    partnerID1: parseInt(personId),
    partnerID2: 7, // אם יש שותף נוסף – שים כאן דינמית
    eventDesc: document.getElementById("description")?.value,
    numOfGuest: parseInt(document.getElementById("guestNumber")?.value),
    eventDate: document.getElementById("date")?.value,
    eventLocation: document.getElementById("location")?.value,
    eventLatitude: selectedCoordinates.latitude,
    eventLongitude: selectedCoordinates.longitude,
  };
  console.log("📋 New Event Data:", newEvent);

  ajaxCall(
    "POST",
    api + "Events",
    JSON.stringify(newEvent),
    function (response) {
      const eventID = response;
      localStorage.setItem("eventID", eventID);
      alert("🎉 שמחה רבה שמחה רבה אביב הגיע חתונה נוצרה!");
    },
    function (error) {
      console.error("❌ Error during event creation:", error);
      alert("שגיאה ביצירת האירוע");
    }
  );
}
