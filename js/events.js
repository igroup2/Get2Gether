$(document).ready(function () {
  // שליפת personID ו-Role מה-localStorage
  const personID = localStorage.getItem("personID");
  const role = localStorage.getItem("Role");

  if (!personID) {
    $("#eventsContainer").html("<p>לא נמצא מזהה משתמש במערכת</p>");
    return;
  }
  const api = "https://localhost:7035/api/";

   if (localStorage.getItem("Role") === "Host") {
    const style = document.createElement("style");
    style.innerHTML = `#myRidesBtn { display: none !important; }`;
    document.head.appendChild(style);
  }
  // הסתרת כפתור "הבקשות וההסעות שלי" אם Role=Host (אות גדולה) מיד בטעינת הדף
  

  ajaxCall(
    "GET",
    api + `Events/${personID}`,
    null,
    function (events) {
      console.log("✅ Events loaded");
      const container = $("#eventsContainer");
      container.empty(); // נקה אם יש משהו

      events.forEach((event) => {
        const evt = event.event;
        const rsvp = event.rsvpStatus;

        console.log("🔎 Event:", evt.eventDesc, "RsvpStatus:", rsvp);

        const date = new Date(evt.eventDate).toLocaleDateString("he-IL");
        let status;
        if (localStorage.getItem("Role") === "Host") {
          status = `<p><strong>סטטוס הגעה:</strong> בעל האירוע</p>`;
        } else {
          status =
            rsvp && rsvp.trim() !== ""
              ? `<p><strong>סטטוס הגעה:</strong> ${rsvp}</p>`
              : `<p><strong>סטטוס הגעה:</strong> טרם נבחר</p>`;
        }

        const cardHtml = `
      <div class="event-card" data-eventid="${evt.eventID}" data-personid="${personID}">
        <h3>${evt.eventDesc}</h3>
        <p><strong>תאריך:</strong> ${date}</p>
        <p><strong>מיקום:</strong> ${evt.eventLocation}</p>
        ${status}
      </div>
    `;
        container.append(cardHtml);
      });

      // האזנה לפתיחת מודאל בלחיצה על אירוע
      $(document).on("click", ".event-card", function () {
        const eventID = $(this).data("eventid");
        const personID = $(this).data("personid");
        if (localStorage.getItem("Role") === "Host") {
          showHostEventModal(eventID);
        } else {
          showGuestEventModal(eventID, personID);
        }
      });

      function showGuestEventModal(eventID, personID) {
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

      function showHostEventModal(eventID) {
        $("#eventModal").remove();
        const modalHtml = `
          <div id="eventModal" class="event-modal-overlay">
            <div class="event-modal-content">
              <button class="event-modal-close" onclick="$('#eventModal').remove()">×</button>
              <h2>אפשרויות לאירוע</h2>
              <button id="selectEventBtn" class="event-modal-link">בחר אירוע</button>
            </div>
          </div>
        `;
        $("body").append(modalHtml);
        // האזנה לכפתור "בחר אירוע"
        $("#selectEventBtn").on("click", function () {
          localStorage.setItem("eventID", eventID);
          window.location.href = "Dashboard.html";
        });
      }
    },
    function (err) {
      console.error("❌ Error loading events", err);
      $("#eventsContainer").html("<p>אירעה שגיאה בטעינת האירועים</p>");
    }
  );

});
