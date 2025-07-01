const api = "https://localhost:7035/api/"; // API URL

let selectedCoordinates = { latitude: 0, longitude: 0 };

window.initAutocomplete = function () {
  const input = document.getElementById("location");
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
};

$(document).ready(function () {
  $("form").on("submit", function (event) {
    event.preventDefault();

    if (
      selectedCoordinates.latitude === 0 &&
      selectedCoordinates.longitude === 0
    ) {
      alert("אנא בחר כתובת מתוך ההשלמה של גוגל");
      return;
    }

    const rideRequest = {
      EventID: 15,
      PersonID: 10,
      NumOfGuest: parseInt($("#guestNumber").val()),
      PickUpLocation: $("#location").val(),
      PreferredGender: $("input[name='preferredGender']:checked").val(),
      PreferredSmoker:
        $("input[name='preferNoSmoking']:checked").val() === "0" ? false : true,
      latitude: selectedCoordinates.latitude,
      longitude: selectedCoordinates.longitude,
      note: $("#notes").val(), // הוספת הערות נוספות
    };

    console.log("📩 Ride request data:", rideRequest);
    ajaxCall(
      "POST",
      api + "RideRequests",
      JSON.stringify(rideRequest),
      (response) => {
        console.log("✅ Success submitting ride request", response);
        alert("הבקשה נשלחה בהצלחה!");
      },
      (error) => {
        console.log("❌ Error submitting ride request", error);
        alert("אירעה שגיאה בשליחה");
      }
    );
  });
});
function toggleMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("active");
}
