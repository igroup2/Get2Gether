const api = "https://localhost:7035/api/";

const eventID = localStorage.getItem("eventID");

let selectedCoordinates = { latitude: 0, longitude: 0 };

let eventdetails = null;

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
        confirmButtonColor: "#f06292",
        cancelButtonColor: "#e0e0e0",
        reverseButtons: true,
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

        getEvevntDetails(function (eventdetails) {
          notifyGuestsOnNewShuttle(eventID, eventdetails, capacity);
        });

        Swal.fire({
          icon: "success",
          title: "הסעה נוצרה בהצלחה!",
          confirmButtonColor: "#f06292",
          cancelButtonColor: "#e0e0e0",
          reverseButtons: true,
        });
        $(".ride-form")[0].reset();
      },
      function (error) {
        console.error("❌ Shuttle creation failed:", error);
        Swal.fire({
          icon: "error",
          title: "שגיאה בשרת",
          text: "אירעה תקלה ביצירת ההסעה.",
          confirmButtonColor: "#f06292",
          cancelButtonColor: "#e0e0e0",
          reverseButtons: true,
        });
      }
    );
  });
});

function getEvevntDetails(callback) {
  ajaxCall(
    "GET",
    api + `Events/${eventID}`,
    null,
    function (response) {
      {
        console.log("✅ Event details fetched for event", eventID, response);
        eventdetails = response[0].event;
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

function toggleMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("active");
}

// --- WhatsApp Notification on New Shuttle ---
function sendShuttleWhatsAppMessage(phone, name, eventdetails, capacity) {
  var instanceId = "instance125498";
  var token = "p0nh304uqoyrth5a";
  var url =
    "https://api.ultramsg.com/" + instanceId + "/messages/chat?token=" + token;
  var dateOnly = eventdetails.eventDate.split("T")[0];
  var message = `היי ${name}!\n
  \n  נוספה הסעה חדשה לאירוע: ${eventdetails.eventDesc} 
  שמתקיים בתאריך ${dateOnly}.\n
  כמות המקומות המוגבלת היא ${capacity}.\n
   לפרטים נוספים היכנסו לאתר שלנו!`;

  var data = {
    to: phone,
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
      console.log(data);
    },
    error: function (xhr, status, error) {
      console.error("AJAX error (shuttle):", error, xhr.responseText);
    },
  });
}

function notifyGuestsOnNewShuttle(eventID, eventdetails, capacity) {
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
