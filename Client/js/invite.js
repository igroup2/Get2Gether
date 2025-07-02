// שליפת פרמטרים מה-URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
// שליפת eventID ו-personID מה-URL
const eventId = getQueryParam("eventID");
const personId = getQueryParam("personID");
console.log("invite.html | eventID:", eventId, "personID:", personId);

if (!eventId || !personId) {
  alert("חסרים נתונים בכתובת (eventID/personID)");
} else {
  const allowedKeys = [
    "eventID",
    "personID",
    "inviteImageUrl",
    `guestFullName_${personId}`,
    `guestPhoneNumber_${personId}`,
    "fullName",
    "phoneNumber",
    "Role",
  ];
  // שמור תמיד Role=Guest כשנכנסים לעמוד זה (לפני מחיקת מפתחות אחרים)
  localStorage.setItem("Role", "Guest");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!allowedKeys.includes(key)) {
      setTimeout(() => localStorage.removeItem(key), 0);
    }
  }
  localStorage.setItem("personID", personId);
  localStorage.setItem("eventID", eventId);

  const fullName = localStorage.getItem(`guestFullName_${personId}`);
  const phoneNumber = localStorage.getItem(`guestPhoneNumber_${personId}`);
  if (fullName) localStorage.setItem("fullName", fullName);
  if (phoneNumber) localStorage.setItem("phoneNumber", phoneNumber);

  if (fullName) {
    document.getElementById(
      "inviteMessage"
    ).innerHTML = `שלום <b>${fullName}</b>,<br>הנכם מוזמנים לחגוג איתנו את היום המאושר בחיינו!<br>נשמח לראותך בין אורחינו ולחגוג יחד ברגעים היפים ביותר.`;
  } else {
    document.getElementById("inviteMessage").innerText =
      "הנכם מוזמנים לחגוג איתנו את היום המאושר בחיינו!";
  }

  let inviteImageUrl = localStorage.getItem("inviteImageUrl");
  const timestamp = Date.now();

  function setImage(src) {
    document.getElementById("inviteImg").src = src + "?v=" + timestamp;
    console.log("invite.html | inviteImg src:", src + "?v=" + timestamp);
  }

  function tryImageWithExtensions(baseUrl, exts, cb) {
    if (!exts.length) {
      cb(null);
      return;
    }
    const ext = exts[0];
    const url = baseUrl + ext;
    const img = new Image();
    img.onload = () => cb(url);
    img.onerror = () => tryImageWithExtensions(baseUrl, exts.slice(1), cb);
    img.src = url + "?v=" + timestamp;
  }

  if (inviteImageUrl) {
    setImage(inviteImageUrl);
  } else {
    const baseUrl =  `https://proj.ruppin.ac.il/igroup2/test2/tar1/invites/event_${eventId}`;
    tryImageWithExtensions(
      baseUrl,
      [".jpg", ".png", ".jpeg", ".webp"],
      function (foundUrl) {
        if (foundUrl) {
          setImage(foundUrl);
          localStorage.setItem("inviteImageUrl", foundUrl);
        } else {
          document.getElementById("inviteImg").alt = "לא נמצאה תמונת הזמנה";
          document.getElementById("inviteImg").style.display = "none";
          alert("לא נמצאה תמונת הזמנה לאירוע");
        }
      }
    );
  }
}

function updateRSVPStatus(status) {
  console.log("נלחץ כפתור אישור הגעה:", status);
  const eventId = localStorage.getItem("eventID");
  const personId = localStorage.getItem("personID");
  if (!eventId || !personId) {
    Swal.fire({
      icon: "error",
      title: "חסרים נתונים",
      text: "לא ניתן לאשר הגעה",
    });
    return;
  }

  if (status === "מגיע/ה") {
    Swal.fire({
      icon: "success",
      title: "איזה כיף!",
      html: "נתראה באירוע בשמחה גדולה 🎉 מחכים לראותך!<br><br><span style='color:#b85b8b;font-weight:bold;'>רוצה לקחת חלק במערך הטרמפים? תוכל להציע או לבקש טרמפ בעמוד הבא!</span>",
      showCancelButton: true,
      confirmButtonText: "כן אני אשמח",
      cancelButtonText: "לא כרגע",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "select.html";
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = "Events.html";
      }
    });
  } else if (status === "לא מגיעה") {
    Swal.fire({
      icon: "info",
      title: "חבל שלא תוכל/י להגיע",
      text: "נשמח לראותך בשמחות הבאות!",
      confirmButtonText: "תודה",
    }).then((result) => {
      window.location.href = "Events.html";
    });
  } else if (status === "מתלבטת") {
    Swal.fire({
      icon: "question",
      title: "נשמח לעדכון בהמשך!",
      text: "האירוע מחכה גם למתלבטים ולמתלבטות 😉",
      confirmButtonText: "אעדכן בקרוב",
    }).then((result) => {
      window.location.href = "Events.html";
    });
  }

  const data = JSON.stringify({
    eventID: parseInt(eventId),
    personID: parseInt(personId),
    rsvpStatus: status,
  });
  console.log("RSVP Payload:", JSON.parse(data));

  ajaxCall(
    "PUT",
    api + "GuestInEvents/UpdateRSVPStatus",
    data,
    function (res) {
      // הצלחה - פופאפ כבר הוצג
    },
    function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status !== 200) {
        Swal.fire({
          icon: "error",
          title: "שגיאה",
          text: "שגיאה בעדכון סטטוס ההגעה",
        });
        console.error("RSVP update error:", jqXHR, textStatus, errorThrown);
      }
    }
  );
}

document.querySelector(".invite-btn.yes").onclick = function () {
  updateRSVPStatus("מגיעה");
};
document.querySelector(".invite-btn.no").onclick = function () {
  updateRSVPStatus("לא מגיעה");
};
document.querySelector(".invite-btn.maybe").onclick = function () {
  updateRSVPStatus("מתלבטת");
};
