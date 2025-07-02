// inviteSender.js
// Handles uploading invite image and sending WhatsApp messages
//const api = "https://proj.ruppin.ac.il/igroup2/test2/tar1/api/";
const api = "https://localhost:7035/api/"; // API URL
// --- Upload Invite Image ---
function setInviteImageUrl(url) {
  if (url) {
    localStorage.setItem("inviteImageUrl", url);
    $("#showInviteBtn").show().data("img", url);
  } else {
    localStorage.removeItem("inviteImageUrl");
    $("#showInviteBtn").hide().data("img", null);
  }
}

$(function () {
  // On page load, show last invite image if exists
  var lastImg = localStorage.getItem("inviteImageUrl");
  if (lastImg) {
    if (!lastImg.startsWith("http")) {
      lastImg = "https://localhost:7035" + lastImg;
    } else if (lastImg.startsWith("http://127.0.0.1:5500")) {
      lastImg = lastImg.replace(
        "http://127.0.0.1:5500",
        "https://localhost:7035"
      );
    }
    $("#showInviteBtn").show().data("img", lastImg);
  } else {
    $("#showInviteBtn").hide().data("img", null);
  }

  // --- Upload Invite Image and Send WhatsApp Message ---
  $("#uploadInviteBtn")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      var fileInput = document.getElementById("inviteImageInput");
      if (!fileInput.files || fileInput.files.length === 0) {
        alert("אנא בחר תמונה להעלאה");
        return;
      }
      var file = fileInput.files[0];
      var eventID = localStorage.getItem("eventID");
      if (!eventID) {
        alert("לא נמצא EventID");
        return;
      }
      var formData = new FormData();
      formData.append("inviteImage", file);
      formData.append("fileName", file.name);
      formData.append("eventID", eventID);
      // Upload image to college server
      $.ajax({
        url: "https://proj.ruppin.ac.il/igroup2/test2/tar5/",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response && response.inviteImageUrl) {
            //https://proj.ruppin.ac.il/igroup2/test1/pages/map.html
            var imgUrl =
              "https://proj.ruppin.ac.il/igroup2/test2/tar5" +
              response.inviteImageUrl;
            console.log("Image URL:", imgUrl);
            $("#inviteImagePreview").html(
              '<img src="' +
                imgUrl +
                '" alt="הזמנה" style="max-width:300px;max-height:300px;border-radius:12px;box-shadow:0 2px 8px #0002;" />'
            );
            // Save the URL for later use
            localStorage.setItem("inviteImageUrl", imgUrl);
            alert("התמונה הועלתה בהצלחה! כעת תוכל לשלוח אותה בוואטסאפ.");
          }
        },
        error: function (xhr, status, error) {
          alert("שגיאה בהעלאת התמונה: " + (xhr.responseText || error));
        },
      });
    });

  // Send WhatsApp message to all guests with the uploaded image
  $("#sendInviteBtn2")
    .off("click")
    .on("click", function () {
      let eventId = localStorage.getItem("eventID") || 6;
      var imgUrl = localStorage.getItem("inviteImageUrl");
      if (!imgUrl) {
        alert("לא קיימת תמונה ציבורית לשליחה. העלה תמונה קודם.");
        return;
      }
      ajaxCall(
        "GET",
        api + `GuestInEvents/GetInviteDetails?eventId=${eventId}`,
        null,
        function (guests) {
          if (guests && guests.length > 0) {
            guests.forEach((g) => {
              const link = `http://localhost:5500/Client/pages/invite.html?eventID=${g.eventID}&personID=${g.personID}`;
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

  $("#showInviteBtn")
    .off("click")
    .on("click", function () {
      var imgUrl = $(this).data("img");
      if (!imgUrl) {
        alert("לא קיימת תמונה להצגה");
        return;
      }
      const urlWithTimestamp =
        imgUrl + (imgUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
      window.open(urlWithTimestamp, "_blank");
    });
});

// --- WhatsApp Message Sending ---
function sendWhatsAppMessage(phone, name, link, imageUrl) {
  var instanceId = "instance125498";
  var token = "p0nh304uqoyrth5a";
  var url =
    "https://api.ultramsg.com/" + instanceId + "/messages/image?token=" + token;
  var message = `היי ${name} ! 🎉\n\nאת/ה מוזמנ/ת לאירוע שלנו – וזה קורה ממש בקרוב!\nכדי שנדע להתארגן כמו שצריך, נשמח אם תאשר/י הגעה דרך הקישור:\n\n👉 ${link}\n\nבמערכת שלנו תוכל לבחור את הדרך שלך להגיע לאירוע, והכל בכמה לחיצות 🙌\nמחכים לראות אותך! 🥳`;
  var data = {
    to: phone,
    image: imageUrl,
    caption: message,
    priority: 10,
  };
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

// --- Send to all guests example ---
$(document).ready(function () {
  $("#sendInviteBtn2").on("click", function () {
    let eventId = 6;
    if (!eventId) {
      alert("לא נמצא eventID ב-localStorage");
      return;
    }
    ajaxCall(
      "GET",
      api + `GuestInEvents/GetInviteDetails?eventId=${eventId}`,
      null,
      function (guests) {
        if (guests && guests.length > 0) {
          guests.forEach((g) => {
            console.log(g);
            const link = `http://127.0.0.1:5500/pages/invite.html?eventID=${g.eventID}&personID=${g.personID}`;
            sendWhatsAppMessage(
              g.phoneNumber,
              g.fullName,
              link,
              "https://proj.ruppin.ac.il/igroup2/test2/tar5/הזמנה לחתונה.jpg"
            );
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
});

// --- Helper for AJAX ---
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
