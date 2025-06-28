$(document).ready(function () {
  console.log("📦 Passenger List Document ready");
  const driverID = 1185; // localStorage.getItem("personID"); // נניח שזה ה־ID של הנהג
  const api = "https://localhost:7035/api/"; // ← הארדקוד לפי בקשה
  const eventID = 1077; //localStorage.getItem("eventID");
  console.log("🚀 Driver ID:", driverID);
  console.log("🚀 Event ID:", eventID);
  ajaxCall(
    "GET",
    api + `Rides/${eventID}/${driverID}`,
    null,
    (passengers) => {
      const container = $("#passengersContainer");
      if (!passengers || passengers.length === 0) {
        container.html("<p>לא שובצו נוסעים להסעה זו.</p>");
        return;
      }

      passengers.forEach((p) => {
        console.log("🧾 נוסע:", p);
        const card = `
  <div class="passenger-card" data-passenger-id="${p.PersonID}">
    <h3>${p.FullName}</h3>
    <p><strong>כתובת:</strong> ${p.PickUpLocation}</p>
    <p><strong>מגדר:</strong> ${
      p.PreferredGender === "M"
        ? "גבר"
        : p.PreferredGender === "F"
        ? "אישה"
        : "לא ידוע"
    }</p>
    <p><strong>מעדיף מעשנים?:</strong> ${p.PreferredSmoker ? "כן" : "לא"}</p>
    <p><strong>טלפון:</strong> ${p.Phone}</p>
    ${p.Note ? `<p><strong>הערה:</strong> ${p.Note}</p>` : ""}
    <div class="passenger-actions">
      <button class="decline-offer-btn">ביטול הצעה</button>
      <button class="approve-offer-btn">אישור הצעה</button>
    </div>
  </div>
`;
        container.append(card);
      });

      // הוספת האזנה לכפתור ביטול הצעה
      container.on("click", ".decline-offer-btn", function () {
        const passengerCard = $(this).closest(".passenger-card");
        const passengerID = passengerCard.data("passenger-id");

        const driverID = localStorage.getItem("personID");
        const eventID = localStorage.getItem("eventID");
        //const driverID = 1185; // או לשלוף מ-localStorage
        //const eventID = 1077; // או לשלוף מ-localStorage
        
        Swal.fire({
          title: "האם אתה בטוח שברצונך לבטל את הצעת ההסעה?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "כן, בטל",
          cancelButtonText: "לא",
        }).then((result) => {
          if (result.isConfirmed) {
            ajaxCall(
              "DELETE",
              api +
                `PassengerInRides?driverID=${driverID}&passengerID=${passengerID}&eventID=${eventID}`,
              null,
              function () {
                Swal.fire("בוצע!", "הצימוד נמחק.", "success");
                passengerCard.remove();
              },
              function (err) {
                Swal.fire("שגיאה", "לא ניתן היה למחוק את הצימוד", "error");
                console.error("❌ שגיאה במחיקת צימוד", err);
              }
            );
          }
        });
      });
    },
    (err) => {
      $("#passengersContainer").html("<p>שגיאה בטעינת הנוסעים.</p>");
      console.error("❌ שגיאה:", err);
    }
  );
});
