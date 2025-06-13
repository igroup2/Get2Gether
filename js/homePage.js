let selectedCoordinates = { latitude: 0, longitude: 0 };

function initAutocomplete() {
  const input = document.getElementById("location");
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"],
    componentRestrictions: { country: "il" },
  });

  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      selectedCoordinates.latitude = place.geometry.location.lat();
      selectedCoordinates.longitude = place.geometry.location.lng();
      console.log("📍 Location selected:", selectedCoordinates);
    } else {
      console.warn("⚠️ כתובת לא תקינה או לא נבחרה מרשימה");
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("editSubmit")
    ?.addEventListener("click", function (e) {
      e.preventDefault(); // מונע ריענון{
      const partner1ID = localStorage.getItem("partner1ID");
      const partner2ID = localStorage.getItem("partner2ID");
      console.log("Partner IDs:", partner1ID, partner2ID);
      if (!partner1ID && !partner2ID) {
        alert("שגיאה: לא נמצא משתמש מזוהה");
        return;
      }

      const newEvent = {
        eventID: parseInt(localStorage.getItem("eventID")),
        partnerID1: parseInt(partner1ID),
        partnerID2: parseInt(partner2ID),
        eventDesc: document.getElementById("description")?.value,
        numOfGuest: parseInt(document.getElementById("guestNumber")?.value),
        eventDate: document.getElementById("date")?.value,
        eventLocation: document.getElementById("location")?.value,
        eventLatitude: selectedCoordinates.latitude,
        eventLongitude: selectedCoordinates.longitude,
      };
      console.log("📋 New Event Data:", newEvent);
      ajaxCall(
        "PUT",
        api + "Events",
        JSON.stringify(newEvent),
        function () {
          alert("✅ האירוע עודכן בהצלחה!");
          return ok();
          window.location.href = "homePage.html";
        },
        function () {
          console.error("❌ Error during event update");
          alert("שגיאה בעדכון האירוע");
          window.location.href = "homePage.html";
        }
      );
    });
});

$(function () {
  // ודא שהקוד רץ רק פעם אחת
  console.log('homePage.js loaded');
  // שמור את מצב הכפתור ב-localStorage (האם יש תמונה אחרונה)
  function setInviteImageUrl(url) {
    if (url) {
      localStorage.setItem('inviteImageUrl', url);
      $('#showInviteBtn').show().data('img', url);
    } else {
      localStorage.removeItem('inviteImageUrl');
      $('#showInviteBtn').hide().data('img', null);
    }
  }

  // בעת טעינת הדף - אם יש תמונה אחרונה, הצג את הכפתור
  var lastImg = localStorage.getItem('inviteImageUrl');
  if (lastImg) {
    // ודא שתמיד נשמרת כתובת מלאה עם השרת
    if (!lastImg.startsWith('http')) {
      lastImg = 'https://localhost:7035' + lastImg;
    } else if (lastImg.startsWith('http://127.0.0.1:5500')) {
      // תקן כתובת לא נכונה שנשמרה בעבר
      lastImg = lastImg.replace('http://127.0.0.1:5500', 'https://localhost:7035');
    }
    $('#showInviteBtn').show().data('img', lastImg);
  } else {
    $('#showInviteBtn').hide().data('img', null);
  }

  $('#uploadInviteBtn').off('click').on('click', function (e) {
    e.preventDefault();
    var fileInput = document.getElementById('inviteImageInput');
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('אנא בחר תמונה להעלאה');
      return;
    }
    var file = fileInput.files[0];
    var eventID = localStorage.getItem('eventID');
    if (!eventID) {
      alert('לא נמצא EventID');
      return;
    }
    var formData = new FormData();
    formData.append('inviteImage', file);
    formData.append('fileName', file.name);
    formData.append('eventID', eventID);
    $.ajax({
      url: api + "Events/UploadInviteImage",
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        alert('התמונה הועלתה בהצלחה!');
        if (response && response.inviteImageUrl) {
          // תמיד שמור כתובת עם השרת הנכון
          var imgUrl = 'https://localhost:7035' + response.inviteImageUrl;
          $('#inviteImagePreview').html('<img src="' + imgUrl + '" alt="הזמנה" style="max-width:300px;max-height:300px;border-radius:12px;box-shadow:0 2px 8px #0002;" />');
          setInviteImageUrl(imgUrl);
        }
      },
      error: function (xhr, status, error) {
        alert('שגיאה בהעלאת התמונה: ' + (xhr.responseText || error));
      }
    });
  });

  $('#showInviteBtn').off('click').on('click', function () {
    var imgUrl = $(this).data('img');
    if (!imgUrl) {
      alert('לא קיימת תמונה להצגה');
      return;
    }
    // פתח תמיד בכתובת של השרת
    window.open(imgUrl, '_blank');
  });
});

$(document).ready(function() {
    $('#sendInviteBtn2').on('click', function() {
        // שליפת eventID מתוך eventGuest ב-localStorage
        let eventId = null;
        const eventGuestStr = localStorage.getItem('eventGuest');
        if (eventGuestStr) {
            try {
                const eventGuestObj = JSON.parse(eventGuestStr);
                eventId = eventGuestObj.eventID;
            } catch (e) {
                console.error('שגיאה בפיענוח eventGuest:', e);
            }
        }
        if (!eventId) {
            alert('לא נמצא eventID ב-localStorage');
            return;
        }
        // קריאת AJAX לשרת לקבלת פרטי האורח לפי eventID מ-GuestInEventController
        ajaxCall(
            'GET',
            `https://localhost:7035/api/GuestInEvents/GetInviteDetails?eventId=${eventId}`,
            null,
            function(data) {
                // הצגת קישורים להזמנות לכל אורח בחלון חדש
                if (Array.isArray(data) && data.length > 0) {
                    openInviteLinksForGuests(data);
                } else {
                    alert('לא נמצאו אורחים לאירוע');
                }
            },
            function(err) {
                console.error('Invite details (ERROR):', err);
                alert('שגיאה בשליפת פרטי ההזמנה');
            }
        );
    });
    // פונקציה ליצירת קישורים להזמנות לכל אורח בחלון חדש
    function openInviteLinksForGuests(guests) {
        let links = guests.map(g => {
            const url = `http://127.0.0.1:5500/pages/invite.html?eventID=${g.eventID}&personID=${g.personID}`;
            return `<div style='margin:10px;'><a href="${url}" target="_blank">${url}</a></div>`;
        }).join('');
        const win = window.open('', '_blank', 'width=700,height=600');
        win.document.write(`<h2>קישורי הזמנות לאורחים</h2>${links}`);
        win.document.close();
    }
});
