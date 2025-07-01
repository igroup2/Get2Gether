// REMOVED to avoid duplicate declaration. Use the global one from js.js

$(document).ready(function () {
  // אם יש צורך, ניתן להוסיף כאן קוד שירוץ כשדף ה־HTML נטען
  const eventID = localStorage.getItem("eventID");
  if (!eventID) {
    console.error("❌ לא נמצא eventID בלוקאל סטורג'");
  } else {
    getRequestData();
  }

  function getRequestData() {
    // קריאה ראשונה: כמות RideRequests
    ajaxCall(
      "GET",
      api + `GuestInEvents/RideRequestsCount?eventID=${eventID}`,
      null,
      function (RideRequestCount) {
        const totalRideRequests = parseInt(RideRequestCount);

        // קריאה שנייה: כמות GiveRideRequests
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
