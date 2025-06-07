const eventID = 15;

$(document).ready(function () {
  ajaxCall(
    "GET",
    `https://localhost:7035/api/GuestInEvents/RSVPChartData?eventID=${eventID}`,
    null,
    function (data) {
      console.log("✅ נתונים שהתקבלו:", data);
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
            backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
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
