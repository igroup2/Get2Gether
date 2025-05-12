const api = "https://localhost:7035/api/";
document.addEventListener("DOMContentLoaded", function () {
<<<<<<< Updated upstream
  let currentStep = 0;
  const steps = document.querySelectorAll(".form-step");

  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === stepIndex);
=======
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
>>>>>>> Stashed changes
    });
    x;
  }

  window.nextStep = function () {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  };

  window.prevStep = function () {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  };

  showStep(currentStep);

  document
    .getElementById("multiStepForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const data = {
        fullName: document.getElementById("fullName").value,
        phoneNumber: document.getElementById("phoneNUmber").value,
        password: document.getElemnetById("password").value,
        gender: document.getElementById("gender1").value,
      };

      ajaxCall(
        "POST",
        api + "Persons/register",
        data,
        function () {
          console.log("Registration successful");
        },
        function (error) {
          console.error("Error during registration:", error);
        }
      );

      alert("ההרשמה הושלמה בהצלחה!");
    });
});

function updateImage(selectId, imgId) {
  const gender = document.getElementById(selectId).value;
  const imgElement = document.getElementById(imgId);

  if (gender === "male") {
    imgElement.src = "../images/groom.webp"; // התמונה של החתן
  } else if (gender === "female") {
    imgElement.src = "../images/bride.webp"; // התמונה של הכלה
  } else {
    imgElement.src = ""; // אם לא נבחר כלום, מוחקים את התמונה
  }
<<<<<<< Updated upstream
=======

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
      localStorage.setItem("pratner1ID", personID);
      alert("✅ ההצטרפות הושלמה בהצלחה!");
      registerPartner2();
      window.location.href = "register-step3.html";
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
  const partner1ID = localStorage.getItem("personID");
  const partner2ID = localStorage.getItem("partner2ID");
  console.log("📋 Person ID from localStorage:", partner1ID);
  console.log("📋 Partner 2 ID from localStorage:", partner2ID);
  if (!partner1ID && !partner2ID) {
    alert("שגיאה: לא נמצא משתמש מזוהה");
    return;
  }

  const newEvent = {
    partnerID1: parseInt(partner1ID),
    partnerID2: parseInt(partner2ID), // אם יש שותף נוסף – שים כאן דינמית
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
>>>>>>> Stashed changes
}
