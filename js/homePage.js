let selectedCoordinates = { latitude: 0, longitude: 0 };
const api = "https://localhost:7035/api/";

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
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("editSubmit")
    ?.addEventListener("click", function (e) {
      e.preventDefault(); // מונע ריענון{
      const partner1ID = localStorage.getItem("partner1ID");
      const partner2ID = localStorage.getItem("partner2ID");
      console.log("Partner IDs:", partner1ID, partner2ID);
      if (!partner1ID && !partner2ID) {
        alert("שגיאה: לא נמצא משתמש מזוהה");
        return;
      }

      const newEvent = {
        eventID: parseInt(localStorage.getItem("eventID")),
        partnerID1: parseInt(partner1ID),
        partnerID2: parseInt(partner2ID),
        eventDesc: document.getElementById("description")?.value,
        numOfGuest: parseInt(document.getElementById("guestNumber")?.value),
        eventDate: document.getElementById("date")?.value,
        eventLocation: document.getElementById("location")?.value,
        eventLatitude: selectedCoordinates.latitude,
        eventLongitude: selectedCoordinates.longitude,
      };
      console.log("📋 New Event Data:", newEvent);
      ajaxCall(
        "PUT",
        api + "Events",
        JSON.stringify(newEvent),
        function () {
          alert("✅ האירוע עודכן בהצלחה!");
          return ok();
          window.location.href = "homePage.html";
        },
        function () {
          console.error("❌ Error during event update");
          alert("שגיאה בעדכון האירוע");
          window.location.href = "homePage.html";
        }
      );
    });
});
