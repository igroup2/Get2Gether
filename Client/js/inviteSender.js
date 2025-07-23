// inviteSender.js
// Handles uploading invite image and sending WhatsApp messages

// --- Save or clear invite image URL ---
function setInviteImageUrl(url) {
  if (url) {
    localStorage.setItem("inviteImageUrl", url);
    console.log("Saved invite image URL:", url);
    $("#showInviteBtn").show().data("img", url);
  } else {
    localStorage.removeItem("inviteImageUrl");
    $("#showInviteBtn").hide().data("img", null);
  }
}

$(function () {
  // On page load, show last invite image if exists
  let lastImg = localStorage.getItem("inviteImageUrl");
  if (lastImg) {
    if (!lastImg.startsWith("http")) {
      lastImg = "https://proj.ruppin.ac.il/igroup2/test2/tar1/" + lastImg;
    }
    $("#showInviteBtn").show().data("img", lastImg);
  } else {
    $("#showInviteBtn").hide().data("img", null);
  }

  // --- Upload Invite Image ---
  $("#uploadInviteBtn")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();

      const fileInput = document.getElementById("inviteImageInput");
      if (!fileInput.files || fileInput.files.length === 0) {
        alert("אנא בחר תמונה להעלאה");
        return;
      }

      const file = fileInput.files[0];
      const eventID = localStorage.getItem("eventID");
      if (!eventID) {
        alert("לא נמצא EventID");
        return;
      }

      const formData = new FormData();
      formData.append("inviteImage", file); // ← חייב להתאים ל־IFormFile בצד שרת
      formData.append("eventID", eventID); // ← מזהה האירוע

      $.ajax({
        url: api + "Upload/InviteImage",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response && response.inviteImageUrl) {
            const imgUrl =
              "https://proj.ruppin.ac.il/igroup2/test2/tar1" +
              response.inviteImageUrl;

            $("#inviteImagePreview").html(
              `<img src="${imgUrl}" alt="הזמנה" style="max-width:300px;max-height:300px;border-radius:12px;box-shadow:0 2px 8px #0002;" />`
            );

            setInviteImageUrl(imgUrl);
            alert("התמונה הועלתה בהצלחה! כעת תוכל לשלוח אותה בוואטסאפ.");
          }
        },
        error: function (xhr, status, error) {
          alert("שגיאה בהעלאת התמונה: " + (xhr.responseText || error));
        },
      });
    });

  // --- Send WhatsApp message to all guests with image ---
  $("#sendInviteBtn2")
    .off("click")
    .on("click", function () {
      const eventID = localStorage.getItem("eventID");
      const imgUrl = localStorage.getItem("inviteImageUrl");

      if (!imgUrl) {
        alert("לא קיימת תמונה ציבורית לשליחה. העלה תמונה קודם.");
        return;
      }

      ajaxCall(
        "GET",
        api + `GuestInEvents/GetInviteDetails?eventId=${eventID}`,
        null,
        function (guests) {
          if (guests && guests.length > 0) {
            guests.forEach((g) => {
              const link = `https://proj.ruppin.ac.il/igroup2/test2/tar2/Client/pages/invite.html?eventID=${g.eventID}&personID=${g.personID}`;
              sendWhatsAppMessage(g.phoneNumber, g.fullName, link, imgUrl);
            });
            alert("ההודעות נשלחו לכל האורחים!");
          } else {
            alert("לא נמצאו אורחים לאירוע");
          }
        },
        function (err) {
          console.error("Invite details (ERROR):", err);
          alert("שגיאה בשליפת פרטי ההזמנה");
        }
      );
    });

  // --- Show uploaded image in new tab ---
  $("#showInviteBtn")
    .off("click")
    .on("click", function () {
      const imgUrl = $(this).data("img");
      if (!imgUrl) {
        alert("לא קיימת תמונה להצגה");
        return;
      }
      const urlWithTimestamp =
        imgUrl + (imgUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
      window.open(urlWithTimestamp, "_blank");
    });
});

// --- WhatsApp Message Sending via UltraMsg ---
function sendWhatsAppMessage(phone, name, link, imageUrl) {
  const instanceId = "instance125498";
  const token = "p0nh304uqoyrth5a";
  const url = `https://api.ultramsg.com/${instanceId}/messages/image?token=${token}`;

  const message = `היי ${name} ! 🎉\n\nאת/ה מוזמנ/ת לאירוע שלנו – וזה קורה ממש בקרוב!\nכדי שנדע להתארגן כמו שצריך, נשמח אם תאשר/י הגעה דרך הקישור:\n\n👉 ${link}\n\nבמערכת שלנו תוכל לבחור את הדרך שלך להגיע לאירוע, והכל בכמה לחיצות 🙌\nמחכים לראות אותך! 🥳`;
  const imageToSend = imageUrl + "?v=" + Date.now();
  const data = {
    to: phone,
    image: imageToSend, // ✅ קישור דינמי
    caption: message,
    priority: 10,
  };

  console.log("Sending WhatsApp message with data:", data);

  $.ajax({
    type: "POST",
    url: url,
    data: data,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    success: function (result) {
      console.log("UltraMsg API response:", result);
    },
    error: function (xhr, status, error) {
      console.error("AJAX error:", error, xhr.responseText);
    },
  });
}

// --- Helper function for general AJAX calls ---
function ajaxCall(
  method,
  api,
  data,
  successCB,
  errorCB,
  contentType,
  dataType
) {
  $.ajax({
    type: method,
    url: api,
    data: data,
    cache: false,
    contentType: contentType || false,
    processData:
      contentType === "application/x-www-form-urlencoded"
        ? true
        : contentType === false
        ? false
        : true,
    dataType:
      dataType ||
      (contentType === "application/x-www-form-urlencoded"
        ? undefined
        : "json"),
    success: successCB,
    error: errorCB,
  });
}
