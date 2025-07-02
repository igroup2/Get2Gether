
let selectedCoordinates = { latitude: 0, longitude: 0 };
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname;

  if (currentPage.endsWith("register-step1.html")) {
    localStorage.clear();
    console.log("🧹 localStorage נמחק כי העמוד הוא register-step1.html");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const firstSubmitBtn = document.getElementById("firstSubmit");
  if (firstSubmitBtn) {
    firstSubmitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      const phoneInput = document.getElementById("phoneNumber");
      const passInput = document.getElementById("password");
      const phone = phoneInput?.value.trim();
      const pass = passInput?.value.trim();

      if (!phone || !pass) {
        alert("יש למלא את כל השדות");
        return;
      }

      const israelPhoneRegex = /^05\d{8}$/;
      if (!israelPhoneRegex.test(phone)) {
        alert("אנא הזן מספר פלאפון תקין (למשל: 0501234567)");
        phoneInput.focus();
        return;
      }

      localStorage.setItem("phoneNumber", phone);
      localStorage.setItem("password", pass);

      window.location.href = "register-step2.html";
    });
  }

  const submit2Btn = document.getElementById("submit2");
  if (submit2Btn) {
    submit2Btn.addEventListener("click", registerPartner1);
  }

  const finalSubmitBtn = document.getElementById("finalSubmit");
  if (finalSubmitBtn) {
    finalSubmitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      submitFinalStep();
    });
  }
});

function updateImage(selectId, imgId) {
  const gender = document.getElementById(selectId)?.value;
  const imgElement = document.getElementById(imgId);
  if (!gender || !imgElement) return;

  imgElement.src =
    gender === "M"
      ? "Client/images/groom.webp"
      : gender === "F"
      ? "Client/images/bride.webp"
      : "";
}

// 👤 שלב 2: רישום partner1
function registerPartner1() {
  const fullName = document.getElementById("partner1")?.value.trim();
  const gender = document.getElementById("gender1")?.value;
  const password = localStorage.getItem("password");
  const phone = localStorage.getItem("phoneNumber");

  if (!fullName || !gender || !password || !phone) {
    alert("יש למלא את כל השדות של בן/בת זוג 1");
    return;
  }

  const israelPhoneRegex = /^05\d{8}$/;
  if (!israelPhoneRegex.test(phone)) {
    alert("מספר הטלפון שנשמר אינו תקין. אנא חזור לשלב הקודם ותקן.");
    return;
  }

  const newPerson = {
    fullName,
    password,
    phoneNumber: phone,
    smoke: false,
    gender,
  };

  ajaxCall(
    "POST",
    api + "Persons/register",
    JSON.stringify(newPerson),
    function (response) {
      localStorage.setItem("partner1ID", response);
      registerPartner2(); // רק אם הצליח
    },
    function (error) {
      console.error("❌ שגיאה בהרשמה של בן/בת זוג 1:", error);
      alert("שגיאה בהרשמה");
    }
  );
}

function registerPartner2() {
  const fullNameInput = document.getElementById("partner2");
  const phoneInput = document.getElementById("phone2");
  const genderInput = document.getElementById("gender2");

  const fullName = fullNameInput?.value.trim();
  const phone = phoneInput?.value.trim();
  const gender = genderInput?.value;
  const password = localStorage.getItem("password");

  const israelPhoneRegex = /^05\d{8}$/;

  // ניקוי קודם של customValidity אם יש
  phoneInput.setCustomValidity("");

  // ולידציות ממוקדות
  if (!fullName) {
    alert("אנא הזן שם מלא של בן/בת זוג 2");
    fullNameInput.focus();
    return;
  }

  if (!phone) {
    alert("אנא הזן מספר פלאפון של בן/בת זוג 2");
    phoneInput.focus();
    return;
  }

  if (!israelPhoneRegex.test(phone)) {
    // כאן אנחנו עושים גם tooltip וגם alert
    phoneInput.setCustomValidity(
      "מספר פלאפון לא תקין – חייב להתחיל ב-05 ולהיות באורך 10 ספרות"
    );
    phoneInput.reportValidity(); // מציג את הטולטיפ של הדפדפן
    alert("מספר הפלאפון של בן/בת זוג 2 אינו תקין");
    phoneInput.focus();
    return;
  }

  if (!gender) {
    alert("יש לבחור מגדר עבור בן/בת זוג 2");
    genderInput.focus();
    return;
  }

  if (!password) {
    alert("שגיאה: לא נשמרה סיסמה מקומית, חזור לשלב הקודם");
    return;
  }

  // אם הכל תקין – ממשיכים
  const partner2 = {
    fullName,
    password,
    phoneNumber: phone,
    smoke: false,
    gender,
  };

  ajaxCall(
    "POST",
    api + "Persons/register",
    JSON.stringify(partner2),
    function (response) {
      localStorage.setItem("partner2ID", response);
      alert("✅ בן/בת הזוג נוספו בהצלחה!");
      window.location.href = "register-step3.html";
    },
    function (error) {
      console.error("❌ שגיאה בהרשמה של בן/בת זוג 2:", error);
      alert("שגיאה בהרשמה");
    }
  );
}

// 🎉 שלב 3: יצירת אירוע
function submitFinalStep() {
  const partner1ID = parseInt(localStorage.getItem("partner1ID"));
  const partner2ID = parseInt(localStorage.getItem("partner2ID"));
  const eventDesc = document.getElementById("description")?.value.trim();
  const numOfGuest = parseInt(document.getElementById("guestNumber")?.value);
  const eventDate = document.getElementById("date")?.value;
  const eventLocation = document.getElementById("location")?.value.trim();

  const { latitude, longitude } = selectedCoordinates;

  if (!partner1ID || !partner2ID) {
    alert("שגיאה: לא נמצאו מזהי בני הזוג");
    return;
  }

  if (!numOfGuest || isNaN(numOfGuest) || numOfGuest < 1) {
    alert("יש להזין מספר אורחים תקין");
    return;
  }

  if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    alert("יש להזין תאריך בפורמט YYYY-MM-DD");
    return;
  }

  if (!eventLocation || eventLocation.length < 2) {
    alert("יש להזין מיקום האירוע");
    return;
  }

  if (!latitude || !longitude || (latitude === 0 && longitude === 0)) {
    alert("יש לבחור מיקום תקין מתוך רשימת Google");
    return;
  }

  const newEvent = {
    partnerID1: partner1ID,
    partnerID2: partner2ID,
    eventDesc,
    numOfGuest,
    eventDate,
    eventLocation,
    eventLatitude: latitude,
    eventLongitude: longitude,
  };

  ajaxCall(
    "POST",
    api + "Events",
    JSON.stringify(newEvent),
    function (response) {
      localStorage.setItem("eventID", response);
      alert("🎉 שמחה רבה שמחה רבה אביב הגיע חתונה נוצרה!");
      window.location.href = "homePage.html";
    },
    function (error) {
      console.error("❌ שגיאה ביצירת האירוע:", error);
      alert("שגיאה ביצירת האירוע\nבדוק שכל השדות מלאים ותקינים");
    }
  );
}

// Google Maps Autocomplete
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
function toggleMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("active");
}
