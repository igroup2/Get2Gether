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
          //window.location.href = "homePage.html";
        },
        function () {
          console.error("❌ Error during event update");
          alert("שגיאה בעדכון האירוע");
          return;
        }
      );
    });
});

$(function () {
  // ודא שהקוד רץ רק פעם אחת
  console.log('homePage.js loaded');
  $('#uploadInviteBtn').off('click').on('click', function (e) {
    e.preventDefault();
    console.log('הועלתה לחיצה על כפתור העלאה');
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
    console.log('נשלח AJAX:', formData);
    $.ajax({
      url: 'https://localhost:7035/api/Events/UploadInviteImage',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        alert('התמונה הועלתה בהצלחה!');
        if (response && response.inviteImageUrl) {
          var imgUrl = response.inviteImageUrl;
          if (imgUrl.startsWith('/')) {
            imgUrl = window.location.origin + imgUrl;
          }
          $('#inviteImagePreview').html('<img src="' + imgUrl + '" alt="הזמנה" style="max-width:300px;max-height:300px;border-radius:12px;box-shadow:0 2px 8px #0002;" />');
        }
      },
      error: function (xhr, status, error) {
        alert('שגיאה בהעלאת התמונה: ' + (xhr.responseText || error));
      }
    });
  });
});
