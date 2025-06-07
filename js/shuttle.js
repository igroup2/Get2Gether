const api = "https://localhost:7035/api/";
const eventID = 1077; // ← הארדקוד לפי בקשה

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
