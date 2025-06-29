const api = "https://localhost:7035/api/"; // ← הארדקוד לפי בקשה
const eventID = localStorage.getItem("eventID");

let selectedCoordinates = { latitude: 0, longitude: 0 };

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

    ajaxCall(
      "POST",
      api + "Shuttles",
      JSON.stringify(shuttle),
      function (response) {
        console.log("✅ Shuttle created:", response);

        notifyGuestsOnNewShuttle(eventID);
        // Reload shuttles after successful creation
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
function toggleMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("active");
}

// --- WhatsApp Notification on New Shuttle ---
function sendShuttleWhatsAppMessage(phone, name) {
  var instanceId = "instance125498";
  var token = "p0nh304uqoyrth5a";
  var url =
    "https://api.ultramsg.com/" + instanceId + "/messages/chat?token=" + token;
  var message = `היי ${name}!\nנוספה הסעה חדשה לאירוע שלך:\n לפרטים נוספים היכנסו לאתר שלנו !`;
  var data = {
    to: "0502280902",
    body: message,
    priority: 10,
  };
  $.ajax({
    type: "POST",
    url: url,
    data: data,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    success: function (result) {
      console.log("UltraMsg API response (shuttle):", result);
    },
    error: function (xhr, status, error) {
      console.error("AJAX error (shuttle):", error, xhr.responseText);
    },
  });
}

function notifyGuestsOnNewShuttle(eventID) {
  ajaxCall(
    "GET",
    api + `GuestInEvents/GetInviteDetails?eventId=${eventID}`,
    null,
    function (guests) {
      if (guests && guests.length > 0) {
        guests.forEach((g) => {
          sendShuttleWhatsAppMessage(g.phoneNumber, g.fullName);
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
