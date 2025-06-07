

console.log("🚀 MyShuttles.js loaded");

let isEditMode = false;

$(document).ready(function () {
  $(document).on("click", ".create-shuttle-btn", function () {
    openShuttleModal();
  });
  console.log("📦 Document ready");
  loadAllShuttles();

  loadAllShuttles();

  // האזנה לכפתור עריכה
  $(document).on("click", "#editToggleBtn", function () {
    isEditMode = !isEditMode;
    $(".shuttle-card").toggleClass("edit-mode", isEditMode);
    $(".delete-btn").toggle(isEditMode);
    $(this).text(isEditMode ? "✅ סיום עריכה" : "✏️ ערוך הסעות");
  });
});

function loadAllShuttles() {
  ajaxCall(
    "GET",
    api + `Shuttles?EventID=${eventID}`,
    null,
    function (response) {
      console.log("✅ Shuttle :", response);
      Swal.fire({
        icon: "success",
        title: "הסעות נטענו בהצלחה!",
        timer: 1000,
        showConfirmButton: false,
      });
      renderShuttleCards(response);
    },
    function (error) {
      console.error("❌ אין הסעות ", error);
    }
  );
}

function renderShuttleCards(shuttles) {
  const container = $("#shuttleContainer");
  container.empty();

  if (shuttles.length === 0) {
    container.append(`
      <div class="no-shuttles">
        <p>אין הסעות קיימות כרגע.</p>
<button class="create-shuttle-btn">+ יצירת הסעה חדשה</button>
      </div>
    `);
    return;
  }

  container.append(`
    <div class="add-shuttle-top">
<button class="create-shuttle-btn">+ יצירת הסעה חדשה</button>
      <button id="editToggleBtn" class="edit-toggle-btn">✏️ ערוך הסעות</button>
    </div>
  `);

  shuttles.forEach((s) => {
    const card = `
      <div class="shuttle-card ${isEditMode ? "edit-mode" : ""}">
        <button class="delete-btn" style="display:${
          isEditMode ? "block" : "none"
        }" onclick="deleteShuttle(${s.shuttleID})">➖</button>
        <h3>הסעה לאירוע</h3>
        <p><strong>שעת יציאה:</strong> ${s.departureTime}</p>
        <p><strong>מיקום יציאה:</strong> ${s.pickUpLocation}</p>
        <p><strong>נהג:</strong> ${s.contactName || "לא ידוע"}</p>
        <p><strong>מספר מקומות:</strong> ${s.capacity}</p>
      </div>
    `;
    container.append(card);
  });
}

function openShuttleModal() {
  initAutocomplete(); // ← כאן מוסיפים את הקריאה
  $("#shuttleModal").fadeIn();
  $("#shuttleForm")[0].reset(); // איפוס הטופס
}

function closeShuttleModal() {
  $("#shuttleModal").fadeOut();
}

function deleteShuttle(ShuttleID) {
  Swal.fire({
    title: "האם למחוק את ההסעה?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "מחק",
    cancelButtonText: "ביטול",
  }).then((result) => {
    if (result.isConfirmed) {
      ajaxCall(
        "DELETE",
        api + `Shuttles/${ShuttleID}`,
        null,
        function () {
          Swal.fire("נמחק!", "ההסעה נמחקה בהצלחה", "success");
          loadAllShuttles();
        },
        function (err) {
          Swal.fire("שגיאה", "מחיקת ההסעה נכשלה", "error");
        }
      );
    }
  });
}
