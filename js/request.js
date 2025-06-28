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
  const api = "https://localhost:7035/api/";

  $("form").on("submit", function (event) {
    event.preventDefault();

    if (
      selectedCoordinates.latitude === 0 &&
      selectedCoordinates.longitude === 0
    ) {
      alert("אנא בחר כתובת מתוך ההשלמה של גוגל");
      return;
    }

    // שליפת ערכי מגדר ועישון מהטופס
    const gender = $("input[name='gender']:checked").val();
    const smoke = $("input[name='smoke']:checked").val() === "1" ? true : false;

    if (!gender || !smoke) {
      alert("אנא בחר מגדר והאם אתה מעשן.");
      return;
    }

    const rideRequest = {
      EventID: parseInt(localStorage.getItem("eventID")),
      PersonID: parseInt(localStorage.getItem("personID")),
      NumOfGuest: parseInt($("#guestNumber").val()),
      PickUpLocation: $("#location").val(),
      PreferredGender: $("input[name='preferredGender']:checked").val(),
      PreferredSmoker:
        $("input[name='preferNoSmoking']:checked").val() === "0" ? false : true,
      latitude: selectedCoordinates.latitude,
      longitude: selectedCoordinates.longitude,
      note: $("#notes").val(),
    };

    console.log("📩 Ride request data:", rideRequest);

    // שליחה עם פרמטרים ב-URL
    ajaxCall(
      "POST",
      api + `RideRequests?gender=${encodeURIComponent(gender)}&smoke=${smoke}`,
      JSON.stringify(rideRequest),
      (response) => {
        console.log("✅ Success submitting ride request", response);
        Swal.fire({
          icon: "success",
          title: "הבקשה נשלחה בהצלחה!",
          text: "תוכל לצפות בכל האירועים שלך בעמוד האירועים.",
          confirmButtonText: "לעמוד האירועים",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "Events.html";
          }
        });
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
