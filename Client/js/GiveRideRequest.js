let selectedCoordinates = { latitude: 0, longitude: 0 };

window.initAutocomplete = function () {
  const input = document.getElementById("rideExitPoint");
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
  const api = "https://proj.ruppin.ac.il/igroup2/test2/tar1/swagger/";
  // //"https://localhost:7035/api/"; // API URL
  
  $("form").on("submit", function (event) {
    event.preventDefault();

    if (
      selectedCoordinates.latitude === 0 &&
      selectedCoordinates.longitude === 0
    ) {
      alert("אנא בחר נקודת יציאה מתוך ההשלמה של גוגל");
      return;
    }

    const gender = $("input[name='gender']:checked").val();
    const smoke = $("input[name='smoke']:checked").val() === "1" ? true : false;

    if (!gender || smoke === null) {
      alert("אנא בחר מגדר והאם אתה מעשן.");
      return;
    }

    const giveRideRequest = {
      EventID: parseInt(localStorage.getItem("eventID")),
      PersonID: parseInt(localStorage.getItem("personID")),
      CarCapacity: parseInt($("#carCapacity").val()),
      RideExitPoint: $("#rideExitPoint").val(),
      PreferredGender: $("input[name='preferredGender']:checked").val(),
      PreferredSmoker:
        $("input[name='preferNoSmoking']:checked").val() === "0" ? false : true,
      latitude: selectedCoordinates.latitude,
      longitude: selectedCoordinates.longitude,
      note: $("#notes").val(),
    };

    console.log("📩 Give ride request data:", giveRideRequest);

    // שליחה עם פרמטרים ב-URL
    ajaxCall(
      "POST",
      api +
        `GiveRideRequests?gender=${encodeURIComponent(gender)}&smoke=${smoke}`,
      JSON.stringify(giveRideRequest),
      (response) => {
        console.log("✅ Success submitting give ride request", response);
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
        console.log("❌ Error submitting give ride request", error);
        alert("שגיאה בשליחת הבקשה.");
      }
    );
  });
});
