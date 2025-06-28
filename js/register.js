const api = "https://localhost:7035/api/";

let selectedCoordinates = { latitude: 0, longitude: 0 };
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname;

  if (currentPage.endsWith("register-step1.html")) {
    localStorage.clear();
    console.log("🧹 localStorage נמחק כי העמוד הוא register-step1.html");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // עמוד שלב 1: שומר טלפון וסיסמה ב-localStorage
  // לנקות את ה-localStorage בכל טעינה
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
      const partner1ID = response;
      console.log("partner1ID:", partner1ID);
      localStorage.setItem("partner1ID", partner1ID);
      alert("✅ ההצטרפות הושלמה בהצלחה!");
      registerPartner2();
    },
    function (error) {
      console.error("❌ Registration failed:", error);
      alert("שגיאה בהרשמה");
    }
  );
  function registerPartner2() {
    const fullName = document.getElementById("partner2")?.value;
    const password = localStorage.getItem("password");
    const phone = document.getElementById("phone2")?.value;
    const gender = document.getElementById("gender2")?.value;

    if (!fullName || !password || !phone || !gender) {
      alert("יש למלא את כל השדות לפני ההצטרפות");
      return;
    }

    const partner2 = {
      fullName: fullName,
      password: password,
      phoneNumber: phone,
      smoke: false,
      gender: gender,
    };
    ajaxCall(
      "POST",
      api + "Persons/register",
      JSON.stringify(partner2),
      function (response) {
        const partner2ID = response;
        console.log("✅ Partner 2 ID:", partner2ID);
        localStorage.setItem("partner2ID", partner2ID);
        alert("צורף בת/בת הזוג בהצלחה!");
        window.location.href = "register-step3.html";
      },
      function (error) {
        console.error("❌ Registration failed:", error);
        alert("שגיאה בהרשמה");
      }
    );
  }
}

// שלב 3: יצירת אירוע
function submitFinalStep() {
  const partner1ID = localStorage.getItem("partner1ID");
  const partner2ID = localStorage.getItem("partner2ID");
  const eventDesc = document.getElementById("description")?.value;
  const numOfGuest = parseInt(document.getElementById("guestNumber")?.value);
  const eventDate = document.getElementById("date")?.value;
  const eventLocation = document.getElementById("location")?.value;
  const eventLatitude = selectedCoordinates.latitude;
  const eventLongitude = selectedCoordinates.longitude;

  // בדיקות ערכים לפני שליחה
  if (!partner1ID || isNaN(parseInt(partner1ID))) {
    alert("שגיאה: לא נמצא משתמש מזוהה (partner1ID)");
    return;
  }
  if (!partner2ID || isNaN(parseInt(partner2ID))) {
    alert("שגיאה: לא נמצא שותף מזוהה (partner2ID)");
    return;
  }
  if (!eventDesc || eventDesc.length < 2) {
    alert("יש להזין תיאור אירוע תקין");
    return;
  }
  if (!numOfGuest || isNaN(numOfGuest) || numOfGuest < 1) {
    alert("יש להזין מספר מוזמנים תקין");
    return;
  }
  if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    alert("יש להזין תאריך בפורמט YYYY-MM-DD");
    return;
  }
  if (!eventLocation || eventLocation.length < 2) {
    alert("יש להזין מיקום אירוע");
    return;
  }
  if (typeof eventLatitude !== "number" || typeof eventLongitude !== "number") {
    alert("יש לבחור מיקום במפה");
    return;
  }
  if (eventLatitude === 0 && eventLongitude === 0) {
    alert("יש לבחור מיקום אמיתי מתוך ההצעות של גוגל (לא להשאיר ברירת מחדל)");
    return;
  }

  const newEvent = {
    partnerID1: parseInt(partner1ID),
    partnerID2: parseInt(partner2ID),
    eventDesc: eventDesc,
    numOfGuest: numOfGuest,
    eventDate: eventDate,
    eventLocation: eventLocation,
    eventLatitude: eventLatitude,
    eventLongitude: eventLongitude,
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
      window.location.href = "homePage.html";
    },
    function (error) {
      console.error("❌ Error during event creation:", error);
      alert("שגיאה ביצירת האירוע\nבדוק שכל השדות מלאים ותקינים");
    }
  );
}
function toggleMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("active");
}
