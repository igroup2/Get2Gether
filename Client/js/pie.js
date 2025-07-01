//const eventID = 15
const eventID = localStorage.getItem("eventID");
const api = "https://proj.ruppin.ac.il/igroup2/test2/tar1/swagger/";
// //"https://localhost:7035/api/"; // API URL
$(document).ready(function () {
  ajaxCall(
    "GET",
    api + `GuestInEvents/RSVPChartData?eventID=${eventID}`,
    null,
    function (data) {
      console.log("✅ נתונים שהתקבלו:", data);

      if (!data || data.length === 0) {
        $("#myPieChart")
          .parent()
          .html(
            '<div style="text-align:center; padding:2em;">אין נתונים להצגה</div>'
          );
        return;
      }

      const labels = data.map((item) => item.status);
      const counts = data.map((item) => item.count);
      drawPieChart(labels, counts);
    },
    function (err) {
      console.error("❌ שגיאה בטעינת תרשים פאי:", err);
    }
  );

  function drawPieChart(labels, counts) {
    const ctx = document.getElementById("myPieChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: ["#f06292", "#c0c0c0", "#000000"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }
});
