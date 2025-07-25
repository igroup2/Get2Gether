// משתנה שמכיל את מזהה האירוע מה-localStorage
const eventID = localStorage.getItem("eventID");

// משתנה שמכיל את הקואורדינטות שנבחרו לאיסוף
let selectedCoordinates = { latitude: 0, longitude: 0 };

// משתנה שמכיל את פרטי האירוע
let eventdetails = null;

// אתחול שדה אוטוקומפליט לכתובת ושמירת קואורדינטות
window.initAutocomplete = function () {
  const input = document.getElementById("pickup");
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

  console.log("✅ Autocomplete initialized");
};

// פונקציה שמאתחלת את הפלאטפיקר ומטפלת בשליחת הטופס ליצירת הסעה
$(document).ready(function () {
  flatpickr("#departure", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
  });

  $(".ride-form").on("submit", function (e) {
    e.preventDefault();

    console.log("🚀 Form submitted");

    const pickup = $("#pickup").val().trim();
    const capacity = parseInt($("#capacity").val().trim());
    const departureTime = $("#departure").val().trim();
    const contactName = $("#contactName").val().trim();
    const contactPhone = $("#contactPhone").val().trim();

    if (
      !pickup ||
      !capacity ||
      !departureTime ||
      !contactName ||
      !contactPhone ||
      !selectedCoordinates.latitude ||
      !selectedCoordinates.longitude
    ) {
      Swal.fire({
        icon: "error",
        title: "שגיאה",
        text: "אנא מלא את כל השדות וודא שנבחרה תחנת איסוף מהרשימה.",
      });
      return;
    }

    const shuttle = {
      eventID: eventID,
      pickUpLocation: pickup,
      latitude: selectedCoordinates.latitude,
      longitude: selectedCoordinates.longitude,
      capacity: capacity,
      departureTime: departureTime,
      contactName: contactName,
      contactPhone: contactPhone,
    };

    // קריאת AJAX: שולחת בקשת יצירת הסעה חדשה לשרת
    ajaxCall(
      "POST",
      api + "Shuttles",
      JSON.stringify(shuttle),
      function (response) {
        console.log("✅ Shuttle created:", response);

        getEvevntDetails(function (eventdetails) {
          notifyGuestsOnNewShuttle(eventID, eventdetails, capacity);
        });

        Swal.fire({
          icon: "success",
          title: "הסעה נוצרה בהצלחה!",
        });
        $(".ride-form")[0].reset();
      },
      function (error) {
        console.error("❌ Shuttle creation failed:", error);
        Swal.fire({
          icon: "error",
          title: "שגיאה בשרת",
          text: "אירעה תקלה ביצירת ההסעה.",
        });
      }
    );
  });
});

// פונקציה שמביאה את פרטי האירוע מהשרת
function getEvevntDetails(callback) {
  // קריאת AJAX: מביאה את פרטי האירוע מהשרת
  ajaxCall(
    "GET",
    api + `Events?eventID=${eventID}`,
    null,
    function (response) {
      {
        console.log("✅ Event details fetched for event", eventID, response);
        eventdetails = response;
        callback(eventdetails);
      }
    },
    function (err) {
      console.error("❌ Error fetching event details:", err);
      eventdetails = null;
      if (callback) callback("פרטים נוספים על האירוע");
    }
  );
}

// פונקציה שמציגה או מסתירה את התפריט הראשי
function toggleMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("active");
}

// --- WhatsApp Notification on New Shuttle ---
// פונקציה ששולחת הודעת וואטסאפ על הסעה חדשה לאורח
function sendShuttleWhatsAppMessage(phone, name, eventdetails, capacity) {
  var instanceId = "instance125498";
  var token = "p0nh304uqoyrth5a";
  var url =
    "https://api.ultramsg.com/" + instanceId + "/messages/chat?token=" + token;
  var dateOnly = eventdetails.eventDate.split("T")[0]; // מתקבל yyyy-mm-dd
  var parts = dateOnly.split("-"); // ["2025", "09", "01"]
  var formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // "01/09/2025"
  var message = `היי ${name}!\n
  \n  נוספה הסעה חדשה לאירוע: ${eventdetails.eventDesc} 
  שמתקיים בתאריך ${formattedDate}.\n
  כמות המקומות המוגבלת היא ${capacity}.\n
   לפרטים נוספים היכנסו לאתר שלנו!`;

  var data = {
    to: phone,
    body: message,
    priority: 10,
  };

  // קריאת AJAX: שליחת הודעת וואטסאפ דרך UltraMsg API
  $.ajax({
    type: "POST",
    url: url,
    data: data,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    success: function (result) {
      console.log("UltraMsg API response (shuttle):", result);
      console.log(data);
    },
    error: function (xhr, status, error) {
      console.error("AJAX error (shuttle):", error, xhr.responseText);
    },
  });
}

// פונקציה שמעדכנת את כל האורחים על הסעה חדשה
function notifyGuestsOnNewShuttle(eventID, eventdetails, capacity) {
  // קריאת AJAX: מביאה את רשימת האורחים לאירוע ומעדכנת אותם על הסעה חדשה
  ajaxCall(
    "GET",
    api + `GuestInEvents/GetInviteDetails?eventId=${eventID}`,
    null,
    function (guests) {
      if (guests && guests.length > 0) {
        guests.forEach((g) => {
          sendShuttleWhatsAppMessage(
            g.phoneNumber,
            g.fullName,
            eventdetails,
            capacity
          );
        });
        console.log("הודעות וואטסאפ נשלחו לכל האורחים על הסעה חדשה");
      } else {
        console.log("לא נמצאו אורחים לאירוע");
      }
    },
    function (err) {
      console.error("שגיאה בשליפת אורחים להזמנת הסעה:", err);
    }
  );
}
