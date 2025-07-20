// API URL

// REMOVED to avoid duplicate declaration. Use the global one from js.js

// אתחול עמוד הדשבורד וטעינת נתונים מהשרת
$(document).ready(function () {
  const eventID = localStorage.getItem("eventID");
  if (!eventID) {
    console.error("❌ לא נמצא eventID בלוקאל סטורג'");
  } else {
    getRequestData();
  }

  // מביא את נתוני הבקשות לאירוע מהשרת ומעדכן ב-HTML
  function getRequestData() {
    // קריאה ראשונה: כמות RideRequests
    // קריאת AJAX: מביאה את כמות הבקשות לנסיעה מהשרת
    ajaxCall(
      "GET",
      api + `GuestInEvents/RideRequestsCount?eventID=${eventID}`,
      null,
      function (RideRequestCount) {
        const totalRideRequests = parseInt(RideRequestCount);

        // קריאה שנייה: כמות GiveRideRequests
        // קריאת AJAX: מביאה את כמות הבקשות לתת טרמפ מהשרת
        ajaxCall(
          "GET",
          api + `GuestInEvents/GiveRideRequestsCount?eventID=${eventID}`,
          null,
          function (GiveRideRequestCount) {
            const totalGiveRideRequests = parseInt(GiveRideRequestCount);

            const totalRequests = totalRideRequests + totalGiveRideRequests;

            // הדפסת לוגים
            console.log("🚗 Total Ride Requests:", totalRideRequests);
            console.log("🧍‍♂️ Total Give Ride Requests:", totalGiveRideRequests);
            console.log("📊 Total Combined Requests:", totalRequests);

            // עדכון ב־HTML
            document.getElementById("totalRequests").textContent =
              totalRequests;
            document.getElementById("rideRequestsCount").textContent =
              totalRideRequests;
            document.getElementById("GiveRideRequestsCount").textContent =
              totalGiveRideRequests;
          },
          function (error) {
            console.error("❌ שגיאה בקריאת GiveRideRequestsCount:", error);
          }
        );
      },
      function (error) {
        console.error("❌ שגיאה בקריאת RideRequestsCount:", error);
      }
    );
  }
});
