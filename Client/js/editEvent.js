let selectedCoordinates = { latitude: 0, longitude: 0 };

// אתחול שדה אוטוקומפליט לכתובת ושמירת קואורדינטות
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
// אתחול עמוד עריכת אירוע, טעינת נתוני אירוע וטיפול בשמירה
document.addEventListener("DOMContentLoaded", function () {
  const eventID = localStorage.getItem("eventID");
  if (eventID) {
    // קריאת AJAX: מביאה את נתוני האירוע מהשרת
    ajaxCall(
      "GET",
      api + `Events?eventID=${eventID}`,
      null,
      function (data) {
        console.log(data);
        document.getElementById("date").value =
          data.eventDate?.split("T")[0] || "";
        document.getElementById("location").value = data.eventLocation || "";
        if (document.getElementById("guestNumber"))
          document.getElementById("guestNumber").value = data.numOfGuest || "";
        if (document.getElementById("description"))
          document.getElementById("description").value = data.eventDesc || "";
        // שמירת קואורדינטות
        selectedCoordinates.latitude = data.eventLatitude || 0;
        selectedCoordinates.longitude = data.eventLongitude || 0;
        if (data.partnerID1) {
          localStorage.setItem("partner1ID", data.partnerID1);
          console.log("Partner 1 ID:", data.partnerID1);
        }
        if (data.partnerID2) {
          localStorage.setItem("partner2ID", data.partnerID2);
          console.log("Partner 2 ID:", data.partnerID2);
        }
      },
      function (err) {
        console.error("❌ Error loading event data:", err);
        alert("שגיאה בטעינת פרטי האירוע");
      }
    );
  }
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

      // קריאת AJAX: שולחת את נתוני האירוע המעודכנים לשרת
      ajaxCall(
        "PUT",
        api + "Events",
        JSON.stringify(newEvent),
        function (data) {
          console.log("✅ Success Response:", data);
          alert("✅ האירוע עודכן בהצלחה!");
          //window.location.href = "homePage.html";
        },
        function (err) {}
      );
    });
});
