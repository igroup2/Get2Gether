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
        const date = new Date(event.eventDate).toLocaleDateString("he-IL");
        const cardHtml = `
          <div class="event-card" data-eventid="${event.eventID}" data-personid="${personID}">
            <h3>${event.eventDesc}</h3>
            <p><strong>תאריך:</strong> ${date}</p>
            <p><strong>מיקום:</strong> ${event.eventLocation}</p>
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
          <div id="eventModal" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);z-index:9999;display:flex;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:18px;max-width:350px;width:90vw;padding:32px 24px;box-shadow:0 8px 32px #0002;text-align:center;position:relative;">
              <button onclick="$('#eventModal').remove()" style="position:absolute;top:12px;left:12px;font-size:1.5rem;background:none;border:none;cursor:pointer;color:#b85b8b;">×</button>
              <h2 style="color:#b85b8b;margin-bottom:18px;">אפשרויות לאירוע</h2>
              <a href="invite.html?eventID=${eventID}&personID=${personID}" style="display:inline-block;margin:12px 0 0 0;padding:12px 32px;background:#f8bbd0;color:#b85b8b;font-weight:bold;border-radius:8px;text-decoration:none;font-size:1.1rem;transition:background 0.2s;">הזמנה לאירוע</a>
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
