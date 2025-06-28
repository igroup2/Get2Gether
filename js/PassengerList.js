$(document).ready(function () {
  console.log("📦 Passenger List Document ready");
  const personID = localStorage.getItem("personID"); // נניח שזה ה־ID של הנהג
  const api = "https://localhost:7035/api/"; // ← הארדקוד לפי בקשה
  const eventID = localStorage.getItem("eventID");
  console.log("🚀 personID ID:", personID);
  console.log("🚀 Event ID:", eventID);
  ajaxCall(
    "GET",
    api + `Rides/${personID}`,
    null,
    (passengers) => {
      const container = $("#passengersContainer");
      if (!passengers || passengers.length === 0) {
        container.html("<p>לא שובצו נוסעים להסעה זו.</p>");
        return;
      }

      // יצירת טבלת נתונים
      let tableHtml = `
        <div class="table-responsive">
        <input type="text" id="tableFilter" placeholder="חפש..." class="table-filter-input" style="margin-bottom:12px; padding:6px; border-radius:8px; border:1px solid #e0e0e0; width:200px;">
        <table class="passenger-table">
          <thead>
            <tr>
              <th></th>
              <th>שם</th>
              <th>טלפון</th>
              <th>כתובת</th>
              <th>אירוע</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
      `;
      passengers.forEach((p, idx) => {
        const isDriver = p.RideExitPoint === null;
        const cardTitle = isDriver ? "נוסע שביקש טרמפ" : "נהג שהציע לך טרמפ";
        let note = "";
        if (
          typeof p.GiveRideNote !== "undefined" &&
          p.GiveRideNote !== null &&
          p.GiveRideNote !== ""
        ) {
          note = p.GiveRideNote;
        } else if (
          typeof p.RideRequestNote !== "undefined" &&
          p.RideRequestNote !== null &&
          p.RideRequestNote !== ""
        ) {
          note = p.RideRequestNote;
        } else if (
          typeof p.Note !== "undefined" &&
          p.Note !== null &&
          p.Note !== ""
        ) {
          note = p.Note;
        } else {
          note = "---";
        }
        // עמודות עיקריות
        tableHtml += `
          <tr data-passenger-id="${
            p.PassengerID
          }" class="main-row" data-row-idx="${idx}">
            <td data-label="" style="width:40px; text-align:center;">
              <button class="toggle-details-btn" data-row-idx="${idx}" title="פרטים נוספים">+</button>
            </td>
            <td data-label="שם">${p.OtherPersonName}</td>
            <td data-label="טלפון">${p.OtherPersonPhone}</td>
            <td data-label="כתובת">${
              p.PickUpLocation ?? p.RideExitPoint ?? "לא צוינה"
            }</td>
            <td data-label="אירוע">${p.EventDesc}
              <div class="extra-details-mobile" style="display:none">
                <div><strong>סוג:</strong> ${cardTitle}</div>
                <div><strong>מס' נוסעים:</strong> ${
                  p.NumberOfPassengers ?? 1
                }</div>
                <div><strong>מגדר:</strong> ${
                  p.Gender === "M"
                    ? "גבר"
                    : p.Gender === "F"
                    ? "אישה"
                    : "לא ידוע"
                }</div>
                <div><strong>מעשן:</strong> ${p.Smoke ? "כן" : "לא"}</div>
                <div><strong>הערה:</strong> ${note}</div>
              </div>
            </td>
            <td>
              <button class="decline-offer-btn">ביטול הצעה</button>
              <button class="approve-offer-btn">אישור הצעה</button>
            </td>
          </tr>
          <tr class="details-row" data-details-idx="${idx}" style="display:none; background:#fce4ec;">
            <td colspan="6">
              <div style="padding:10px 0; text-align:right;">
                <strong>סוג:</strong> ${cardTitle} &nbsp; | &nbsp;
                <strong>מס' נוסעים:</strong> ${
                  p.NumberOfPassengers ?? 1
                } &nbsp; | &nbsp;
                <strong>מגדר:</strong> ${
                  p.Gender === "M"
                    ? "גבר"
                    : p.Gender === "F"
                    ? "אישה"
                    : "לא ידוע"
                } &nbsp; | &nbsp;
                <strong>מעשן:</strong> ${p.Smoke ? "כן" : "לא"} &nbsp; | &nbsp;
                <strong>הערה:</strong> ${note}
              </div>
            </td>
          </tr>
        `;
      });
      tableHtml += `</tbody></table></div>`;
      container.html(tableHtml);

      // כפתור הצגת פרטים נוספים
      container.on("click", ".toggle-details-btn", function () {
        const idx = $(this).data("row-idx");
        const detailsRow = $(`tr.details-row[data-details-idx='${idx}']`);
        const mainRow = $(this).closest(".main-row");
        // במובייל - הצג/הסתר div בתוך הכרטיסיה
        if (window.innerWidth <= 600) {
          const extra = mainRow.find(".extra-details-mobile");
          if (extra.is(":visible")) {
            extra.hide();
            $(this).text("+");
          } else {
            extra.show();
            $(this).text("-");
          }
        } else {
          // בדסקטופ - הצג/הסתר שורת פרטים
          detailsRow.toggle();
          if (detailsRow.is(":visible")) {
            $(this).text("-");
          } else {
            $(this).text("+");
          }
        }
      });

      // סינון טבלה
      $("#tableFilter").on("keyup", function () {
        const value = $(this).val().toLowerCase();
        $(".passenger-table tbody tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      });

      // האזנה לכפתור ביטול הצעה
      container.on("click", ".decline-offer-btn", function () {
        const row = $(this).closest("tr");
        const passengerID = row.data("passenger-id");
        const driverID = localStorage.getItem("personID");
        const eventID = localStorage.getItem("eventID");
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
              api + `Rides/${driverID}/${passengerID}/${eventID}`,
              null,
              function () {
                Swal.fire("בוצע!", "הצימוד נמחק.", "success");
                row.remove();
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
