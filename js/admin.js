const api = "https://localhost:7035/api/";
document
  .getElementById("loadSettingsBtn")
  .addEventListener("click", function () {
    var eventId = document.getElementById("eventId").value;
    GetEventSettings(eventId);
  });

function GetEventSettings(eventId) {
  console.log("GetEventSettings called with eventId:", eventId);
  ajaxCall(
    "GET",
    api + `EventSettings/${eventId}`,
    null,
    (data) => {
      console.log("הגדרות האירוע:", data);
      renderEventSettings(data);
    },
    (err) => {
      console.error("❌ שגיאה בהגדרות האירוע:", err);
    }
  );
}

function renderEventSettings(data) {
  const container = document.getElementById("eventSettingsContainer");
  if (!container) {
    console.error("❌ לא נמצא אלמנט להצגת ההגדרות.");
    return;
  }

  container.innerHTML = `
      <h3>הגדרות אירוע</h3>
      <table id="settingsTable" style="width:100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ccc; padding: 8px;">שם שדה</th>
            <th style="border: 1px solid #ccc; padding: 8px;">ערך</th>
          </tr>
        </thead>
        <tbody>
          ${renderSettingRow(
            "מרחק אווירי לסינון הראשוני",
            "distanceFirstFilter",
            data.distanceFirstFilter
          )}
          ${renderSettingRow(
            "זמן סטייה לאסיפת נוסע בדקות",
            "detourTime",
            data.detourTime
          )}
          ${renderSettingRow(
            "משקל ציון מרחק",
            "distanceWeight",
            data.distanceWeight
          )}
          ${renderSettingRow(
            "משקל העדפת עישון",
            "smokingPreferenceWeight",
            data.smokingPreferenceWeight
          )}
          ${renderSettingRow(
            "משקל קרבה משפחתית",
            "familyRelationWeight",
            data.familyRelationWeight
          )}
          ${renderSettingRow(
            "משקל העדפת מגדר",
            "genderPreferenceWeight",
            data.genderPreferenceWeight
          )}
          ${renderSettingRow(
            "משקל התחשבות בנוסעים בודדים",
            "lonleyWeight",
            data.lonleyWeight
          )}
        </tbody>
      </table>
  
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="saveSettings(${
          data.eventID
        })" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
          שמור שינויים
        </button>
      </div>
    `;
}

// פונקציה ליצירת שורה בטבלה
function renderSettingRow(label, key, value) {
  return `
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;">${label}</td>
        <td style="border: 1px solid #ccc; padding: 8px;">
          <input type="number" step="0.01" id="${key}" value="${value}" style="width: 100%; padding: 5px;" />
        </td>
      </tr>
    `;
}

// פונקציה לשמירת השינויים
function saveSettings(eventID) {
  const updatedSettings = {
    eventID: eventID,
    distanceFirstFilter: parseFloat(
      document.getElementById("distanceFirstFilter").value
    ),
    detourTime: parseFloat(document.getElementById("detourTime").value),
    distanceWeight: parseFloat(document.getElementById("distanceWeight").value),
    smokingPreferenceWeight: parseFloat(
      document.getElementById("smokingPreferenceWeight").value
    ),
    familyRelationWeight: parseFloat(
      document.getElementById("familyRelationWeight").value
    ),
    genderPreferenceWeight: parseFloat(
      document.getElementById("genderPreferenceWeight").value
    ),
    lonleyWeight: parseFloat(document.getElementById("lonleyWeight").value),
  };

  console.log("🚀 שולח עדכון:", updatedSettings);

  ajaxCall(
    "PUT", // נניח שיש לך בשרת API עדכון ב- PUT
    api + `EventSettings/UpdateEventSettings`,
    JSON.stringify(updatedSettings),
    (data) => {
      Swal.fire("בוצע!", "הגדרות האירוע עודכנו בהצלחה.", "success");
    },
    (err) => {
      Swal.fire("שגיאה!", "לא הצלחנו לעדכן את הגדרות האירוע.", "error");
    }
  );
}
