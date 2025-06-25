$(document).ready(function () {
  // שליפת personID מה-localStorage
  const personID = localStorage.getItem("personID");
  if (!personID) {
    $("#eventsContainer").html("<p>לא נמצא מזהה משתמש במערכת</p>");
    return;
  }
  const api = "https://localhost:7035/api/";
  ajaxCall(
    "GET",
    api + `Events/${personID}`,
    null,
    function (events) {
      console.log("✅ Events loaded");
      const container = $("#eventsContainer");
      container.empty(); // נקה אם יש משהו

      events.forEach((event) => {
        console.log("🔎 Event:", event.eventDesc, "RsvpStatus:", event.rsvpStatus);
        const date = new Date(event.eventDate).toLocaleDateString("he-IL");
       const status = event.rsvpStatus && event.rsvpStatus.trim() !== ""
        ? `<p><strong>סטטוס הגעה:</strong> ${event.rsvpStatus}</p>`
         : `<p><strong>סטטוס הגעה:</strong> טרם נבחר</p>`;
        // יצירת כרטיס אירוע
        const cardHtml = `
          <div class="event-card" data-eventid="${event.eventID}" data-personid="${personID}">
            <h3>${event.eventDesc}</h3>
            <p><strong>תאריך:</strong> ${date}</p>
            <p><strong>מיקום:</strong> ${event.eventLocation}</p>
            ${status}

          </div>
        `;
        container.append(cardHtml);
      });
      // האזנה לפתיחת מודאל בלחיצה על אירוע
      $(document).on("click", ".event-card", function () {
        const eventID = $(this).data("eventid");
        const personID = $(this).data("personid");
        showEventModal(eventID, personID);
      });

      function showEventModal(eventID, personID) {
        // אם כבר קיים מודאל – הסר אותו
        $("#eventModal").remove();
        const modalHtml = `
          <div id="eventModal" class="event-modal-overlay">
            <div class="event-modal-content">
              <button class="event-modal-close" onclick="$('#eventModal').remove()">×</button>
              <h2>אפשרויות לאירוע</h2>
              <a href="invite.html?eventID=${eventID}&personID=${personID}" class="event-modal-link">
                שינוי סטטוס הגעה
              </a>
            </div>
          </div>
        `;
        $("body").append(modalHtml);
      }
    },
    function (err) {
      console.error("❌ Error loading events", err);
      $("#eventsContainer").html("<p>אירעה שגיאה בטעינת האירועים</p>");
    }
  );
});
