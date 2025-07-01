$(document).ready(function () {
  console.log("📦 Passenger List Document ready");
  const personID = localStorage.getItem("personID");
  const api = "https://proj.ruppin.ac.il/igroup2/test2/tar1/swagger/";
  //"https://localhost:7035/api/"; // ← הארדקוד לפי בקשה
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

      // טאבים יפים לסינון (במקום כפתורי תצוגה)
      let viewToggleHtml = `
        <div class="table-tabs" style="margin-bottom:0;">
          <div class="table-tab active" data-view="all" title="הצג את כל הנסיעות (בקשות והצעות)">הכל</div>
          <div class="table-tab" data-view="requests" title="הצג רק בקשות לטרמפ">בקשות</div>
          <div class="table-tab" data-view="offers" title="הצג רק הצעות לטרמפ">הצעות</div>
        </div>
      `;
      // שים את שדה החיפוש ראשון, ואז את הטאבים, ואז את הטבלה
      let tableHtml = `
        <div class="table-responsive">
        <input type="text" id="tableFilter" placeholder="חפש..." class="table-filter-input" style="margin-bottom:12px; padding:6px; border-radius:8px; border:1px solid #e0e0e0; width:200px;">
        ${viewToggleHtml}
        <table class="passenger-table">
          <thead>
            <tr>
              <th></th>
              <th><span class="icon-user" title="שם הנוסע/נהג"></span> שם</th>
              <th><span class="icon-phone" title="מספר טלפון"></span> טלפון</th>
              <th><span class="icon-location" title="כתובת איסוף/ירידה"></span> כתובת</th>
              <th><span class="icon-event" title="שם האירוע"></span> אירוע</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
      `;

      passengers.forEach((p, idx) => {
        console.log("🚦 נוסע:", p); // בדיקת מבנה האובייקט
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
        // מיפוי סטטוס לייצוג בעברית
        const statusMap = {
          PendingDriver: "מחכה לאישור הנהג",
          PendingPassenger: "הנהג אישר, מחכה לאישור הנוסע",
          Confirmed: "שני הצדדים אישרו – שיבוץ תקף",
          CancelledByDriver: "מבוטל על ידי נהג",
          CancelledByPassenger: "מבוטל על ידי נוסע",
        };
        const rideStatusText =
          statusMap[p.RideStatus] || p.RideStatus || "לא ידוע";
        console.log("RideStatus:", p.RideStatus);
        // עמודות עיקריות
        const isRequest = p.RideExitPoint === null;
        const rowClass = isRequest ? "request-row" : "offer-row";
        // הוספת קלאס לרשומה לא פעילה
        const inactiveClass = Number(p.IsActive) === 0 ? "inactive-row" : "";
        // הוספת קלאס לרשומה מאושרת
        const confirmedClass =
          p.RideStatus === "Confirmed" ? "confirmed-row" : "";
        // קבע האם להציג את הטלפון או להסתיר
        let phoneCellHtml = "";
        let phoneHidden = false;
        if (!isRequest && p.RideStatus !== "Confirmed") {
          // הצעה לטרמפ, והסטטוס לא מאושר - הסתר טלפון
          phoneCellHtml = `<span class="hidden-phone" data-phone="${p.OtherPersonPhone}" style="color:#aaa;cursor:pointer;text-decoration:underline;">הצג מספר</span>`;
          phoneHidden = true;
        } else {
          // בקשה או סטטוס מאושר - הצג טלפון
          phoneCellHtml = `${p.OtherPersonPhone}`;
        }
        tableHtml += `
         <tr data-passenger-id="${p.OtherPersonID}" data-ride-id="${
          p.RideID
        }" data-event-id="${
          p.EventID
        }" class="main-row ${rowClass} ${inactiveClass} ${confirmedClass}" data-row-idx="${idx}">
            <td data-label="" style="width:40px; text-align:center;" class="${inactiveClass} ${confirmedClass}">
              <button class="toggle-details-btn" data-row-idx="${idx}" title="פרטים נוספים">+</button>
            </td>
            <td data-label="שם" class="${inactiveClass} ${confirmedClass}">${
          p.OtherPersonName
        }</td>
            <td data-label="טלפון" class="${inactiveClass} ${confirmedClass}">${phoneCellHtml}</td>
            <td data-label="כתובת" class="${inactiveClass} ${confirmedClass}">${
          p.PickUpLocation ?? p.RideExitPoint ?? "לא צוינה"
        }</td>
            <td data-label="אירוע" class="${inactiveClass} ${confirmedClass}">${
          p.EventDesc
        }</td>
             <td
            <div class="extra-details-mobile" style="display:none; margin-top:8px;">
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
            <td class="${inactiveClass} ${confirmedClass}">
              <button class="decline-offer-btn upgraded-btn" title="ביטול הצעה" ${
                p.RideStatus === "Confirmed" || Number(p.IsActive) === 0
                  ? "disabled style='opacity:0.5;cursor:not-allowed;'"
                  : ""
              }><span class="icon-x">✖️</span> ביטול</button>
              <button class="approve-offer-btn upgraded-btn" title="אישור הצעה" ${
                p.RideStatus === "Confirmed" || Number(p.IsActive) === 0
                  ? "disabled style='opacity:0.5;cursor:not-allowed;'"
                  : ""
              }><span class="icon-check">✔️</span> אישור</button>
            </td>
          </tr>
          <tr class="details-row" data-details-idx="${idx}" style="display:none;">
            <td colspan="6">
              <div class="details-card">
                <div class="details-row-icons">
                  <span class="icon-user">👤</span> <b>${
                    p.OtherPersonName
                  }</b> &nbsp; | &nbsp;
                  <span class="icon-phone">📞</span> <b>${
                    phoneHidden
                      ? `<span class='hidden-phone' data-phone='${p.OtherPersonPhone}' style='color:#aaa;cursor:pointer;text-decoration:underline;'>הצג מספר</span>`
                      : p.OtherPersonPhone
                  }</b> <button class="copy-phone-btn" data-phone="${
          p.OtherPersonPhone
        }" title="העתק מספר" ${
          phoneHidden ? "disabled style='opacity:0.4;cursor:not-allowed;'" : ""
        }>📋</button> &nbsp; | &nbsp;
                  <span class="icon-location">📍</span> <b>${
                    p.PickUpLocation ?? p.RideExitPoint ?? "לא צוינה"
                  }</b>
                </div>
                <div style="margin-top:8px;">
                  <span class="icon-event"></span> <strong>אירוע:</strong> ${
                    p.EventDesc
                  } &nbsp; | &nbsp;
                  <strong>סוג:</strong> ${cardTitle} &nbsp; | &nbsp;
                  <strong>סטטוס:</strong> ${rideStatusText} &nbsp; | &nbsp;
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
                  <strong>מעשן:</strong> ${
                    p.Smoke ? "כן" : "לא"
                  } &nbsp; | &nbsp;
                  <strong>הערה:</strong> ${note}
                </div>
              </div>
            </td>
          </tr>
        `;
      });
      // בסוף הבנייה:
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
        // אם החיפוש ריק, סגור את כל שורות הפרטים הנוספים והחזר כפתורים ל+
        if (!value) {
          $("tr.details-row").hide();
          $(".toggle-details-btn").text("+");
          $(".extra-details-mobile").hide();
        }
      });

      // האזנה לטאבים לסינון
      container
        .off("click", ".table-tab")
        .on("click", ".table-tab", function () {
          // סגור את כל שורות הפרטים הנוספים והחזר כפתורים ל+
          $("tr.details-row").hide();
          $(".toggle-details-btn").text("+");
          $(".extra-details-mobile").hide();
          // המשך לוגיקת טאבים רגילה
          $(".table-tab").removeClass("active");
          $(this).addClass("active");
          const view = $(this).data("view");
          if (view === "all") {
            $(".main-row").show();
          } else if (view === "requests") {
            $(".main-row").hide();
            $(".main-row.request-row").show();
          } else if (view === "offers") {
            $(".main-row").hide();
            $(".main-row.offer-row").show();
          }
        });

      // האזנה לכפתור ביטול הצעה
      container.on("click", ".decline-offer-btn", function () {
        const row = $(this).closest("tr");
        const passengerID = row.data("passenger-id");
        const driverID = localStorage.getItem("personID");
        const eventID = row.data("event-id"); // ← שלוף מהשורה
        Swal.fire({
          title: "האם אתה בטוח שברצונך לבטל את הצעת ההסעה?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "כן, בטל",
          cancelButtonText: "לא",
          confirmButtonColor: "#f06292", // ורוד
          cancelButtonColor: "#e0e0e0", // אפור בהיר
          reverseButtons: true,
        }).then((result) => {
          const passengerID = row.data("passenger-id");
          const driverID = localStorage.getItem("personID");
          const eventID = row.data("event-id"); // ← שלוף מהשורה

          if (!passengerID || !driverID || !eventID) {
            console.error("❌ ערך חסר במחיקת צימוד:", {
              driverID,
              passengerID,
              eventID,
            });
            Swal.fire("שגיאה", "לא ניתן לבצע את המחיקה – נתון חסר.", "error");
            return;
          }

          if (result.isConfirmed) {
            ajaxCall(
              "DELETE",
              api + `Rides/${driverID}/${passengerID}/${eventID}`,
              null,
              function () {
                Swal.fire("בוצע!", "הצימוד נמחק.", "success", {
                  confirmButtonColor: "#f06292",
                  reverseButtons: true,
                });
                row.remove();
              },
              function (err) {
                Swal.fire("שגיאה", "לא ניתן היה למחוק את הצימוד", "error", {
                  confirmButtonColor: "#f06292",
                  reverseButtons: true,
                });
                console.error("❌ שגיאה במחיקת צימוד", err);
              }
            );
          }
        });
      });

      // האזנה לכפתור אישור הצעה
      container.on("click", ".approve-offer-btn", function () {
        const row = $(this).closest("tr");
        const rideID = row.data("ride-id") || row.attr("data-ride-id");
        if (!rideID) {
          console.error("❌ RideID not found on row");
          Swal.fire("שגיאה", "לא נמצא מזהה נסיעה", "error", {
            confirmButtonColor: "#f06292",
            reverseButtons: true,
          });
          return;
        }

        const personID = localStorage.getItem("personID");
        const isDriver =
          row.find("td[data-label='כתובת']").text().trim() === "לא צוינה";
        const role = isDriver ? "Driver" : "Passenger";
        console.log("🚀 Approving ride with ID:", rideID, "as role:", role);
        Swal.fire({
          title: "לאשר את הטרמפ?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "אישור",
          cancelButtonText: "ביטול",
          confirmButtonColor: "#f06292", // ורוד
          cancelButtonColor: "#e0e0e0", // אפור בהיר
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("📤 Sending personID:", personID);

            ajaxCall(
              "PUT",
              api + `Rides/ApproveRide/${rideID}`,
              JSON.stringify(parseInt(personID)), // ✅ שולח מספר בלבד
              function (responseText) {
                Swal.fire("בוצע!", responseText, "success", {
                  confirmButtonColor: "#f06292",
                  reverseButtons: true,
                }).then(() => {
                  location.reload();
                });
              },
              function (err) {
                Swal.fire(
                  "שגיאה",
                  err.responseText || "לא ניתן היה לאשר את הטרמפ",
                  "error",
                  { confirmButtonColor: "#f06292", reverseButtons: true }
                );
                console.error("❌ שגיאה באישור טרמפ", err);
              }
            );
          }
        });
      });

      // האזנה להעתקת טלפון
      container.on("click", ".copy-phone-btn", function () {
        const phone = $(this).data("phone");
        navigator.clipboard.writeText(phone);
        $(this).text("✔");
        setTimeout(() => {
          $(this).text("📋");
        }, 1200);
      });

      // הצגת טלפון מוסתר - הודעה
      container.on("click", ".hidden-phone", function (e) {
        e.preventDefault();
        Swal.fire({
          icon: "info",
          title: "המספר חסום",
          text: "רק לאחר שתאשר את הצימוד תוכל לקבל את מספר הפלאפון של הנהג.",
          confirmButtonText: "הבנתי",
          confirmButtonColor: "#f06292",
          reverseButtons: true,
        });
      });
    },
    (err) => {
      console.error("❌ שגיאה בטעינת נוסעים", err);
      $("#passengersContainer").html(
        "<p style='color:red;'>שגיאה בטעינת נתוני הנוסעים. אנא רענן את העמוד וניסיון שוב.</p>"
      );
    }
  );
});
