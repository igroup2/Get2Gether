var NumOfEvents = 2;

// ✅ קריאה ל-Google Directions API לחישוב זמן סטייה עבור כל צמד (נהג, נוסע)

function calculateDelayMinutes(
  driverCoords,
  riderCoords,
  eventCoords,
  callback
) {
  const directionsService = new google.maps.DirectionsService();

  const origin = { lat: driverCoords.y, lng: driverCoords.x };
  const waypoint = {
    location: { lat: riderCoords.y, lng: riderCoords.x },
    stopover: true,
  };
  const destination = { lat: eventCoords.y, lng: eventCoords.x };

  // שלב 1: חישוב זמן מסלול ישיר מנהג לאירוע
  directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (directRes, status1) => {
      if (status1 !== "OK") return callback(-1);

      const directDuration = directRes.routes[0].legs.reduce(
        (sum, leg) => sum + leg.duration.value,
        0
      );

      // שלב 2: חישוב זמן מסלול עם איסוף נוסע
      directionsService.route(
        {
          origin,
          destination,
          waypoints: [waypoint],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (withPickupRes, status2) => {
          if (status2 !== "OK") return callback(-1);

          const withPickupDuration = withPickupRes.routes[0].legs.reduce(
            (sum, leg) => sum + leg.duration.value,
            0
          );

          const delayMinutes = (withPickupDuration - directDuration) / 60;
          callback(delayMinutes);
        }
      );
    }
  );
}

// ✅ לולאה על כל MatchResult כדי להוסיף delayMinutes לכל נוסע פוטנציאלי
function enrichMatchResultsWithDelays(data, eventCoords, callback) {
  let enrichedResults = [];
  let totalPairs = data.reduce(
    (sum, match) => sum + match.potentialRiders.length,
    0
  );
  let completed = 0;

  data.forEach((match) => {
    let driver = match.driver;
    let riders = match.potentialRiders;
    let enrichedRiders = [];

    riders.forEach((rider) => {
      calculateDelayMinutes(
        driver.rideExitCoordinates,
        rider.pickUpCoordinates,
        eventCoords,
        (delay) => {
          enrichedRiders.push({
            ...rider,
            delayMinutes: delay,
          });

          completed++;

          // כשהשלמנו את כל הצמדים (נהג-נוסע), מחזירים את כל הנתונים
          if (completed === totalPairs) {
            enrichedResults.push({
              driver: driver,
              potentialRiders: enrichedRiders,
            });

            if (enrichedResults.length === data.length) {
              callback(enrichedResults);
            }
          }
        }
      );
    });
  });
}
// ✅ שלב שני: שליחת MatchResult enriched עם delayMinutes לשרת
function sendToRunAlgo(matchResultsWithDelays) {
  ajaxCall(
    "POST",
    "https://proj.ruppin.ac.il/igroup2/prod/api/RideMatchers/RunAlgo",
    JSON.stringify(matchResultsWithDelays),
    (result) => {
      console.log("✅ תוצאות שיבוץ סופי מהשרת:", result);
      // תוכל להציג את השיבוצים במפה או בטבלה כאן
    },
    (err) => {
      console.error("❌ שגיאה באלגוריתם:", err);
    }
  );
}

// מערכים + מזהים גלובליים
const giveRideRequests = [];
const rideRequests = [];
let event = [];
let currentPersonID = 1;
let currentRequestID = 1;
const EVENT_ID = 555;

// ברירת מחדל לסוג פין
let selectedMarkerType = "rideRequest"; // ברירת מחדל

const map = L.map("map", {
  center: [31.0461, 34.8516],
  zoom: 7,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "",
}).addTo(map);
// יצירת אובייקט של המפה
const icons = {
  rideRequest: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
  giveRideRequest: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
  eventLocation: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  }),
};

// שלב שני
// פונקציה לשליחה לשרת עם תוצאות הסינון הראשוני של הצמדים
function sendDetourResultsToServer(results) {
  // טבלת תוצאות ראשונית
  renderInitialResultsTable(results);
  console.log("📦 שולחים תוצאות לשרת:", results);
  const num = 10;
  ajaxCall(
    "POST",
    `https://proj.ruppin.ac.il/igroup2/prod/api/Algos?maxS=${num}`,
    JSON.stringify(results),
    (data) => {
      console.log("✅   שיבוצים סופיים :", data);
      renderMatchResultsTable(data);
    },
    (err) => {
      console.error("❌ שגיאה בשליחה לשרת:", err);
    }
  );
}
// פונקציה להוספת פין למפה
function addMarker(lat, lng, label, type) {
  if (type === "eventLocation" && event.length > 0) {
    alert("לא ניתן להוסיף יותר מאירוע אחד.");
    return;
  }

  const marker = L.marker([lat, lng], { icon: icons[type] })
    .addTo(map)
    .bindPopup(label); // פופאפ שמציג את הטקסט
}
// פונקציה להוספת מיקום הנהג על המפה
// הוספת מיקום הנהג על המפה עם מידע על מיקום, סוג הפין והכפתור שנלחץ
function addGiveRideMarkers(giveRideRequests) {
  giveRideRequests.forEach(function (giveRide) {
    if (
      giveRide.rideExitCoordinates &&
      giveRide.rideExitCoordinates.x &&
      giveRide.rideExitCoordinates.y
    ) {
      const label = `
        🚙 נהג<br>
        📄 Request ID: ${giveRide.id}<br>
        🧍 Person ID: ${giveRide.personID}
      `;

      addMarker(
        giveRide.rideExitCoordinates.y,
        giveRide.rideExitCoordinates.x,
        label,
        "giveRideRequest"
      );
    }
  });
}
// פונקציה להוספת מיקום הנוסע על המפה
// הוספת מיקום הנוסע על המפה עם מידע על מיקום, סוג הפין והכפתור שנלחץ
function addRideRequestMarkers(rideRequests) {
  rideRequests.forEach(function (ride) {
    if (
      ride.pickUpCoordinates &&
      ride.pickUpCoordinates.x &&
      ride.pickUpCoordinates.y
    ) {
      const label = `
        🧑 נוסע<br>
        📄 Request ID: ${ride.id}<br>
        🧍 Person ID: ${ride.personID}
      `;

      addMarker(
        ride.pickUpCoordinates.y,
        ride.pickUpCoordinates.x,
        label,
        "rideRequest"
      );
    }
  });
}
// פונקציה להוספת מיקום האירוע על המפה
function addEventMarker(eventCoordinates, eventLocation) {
  if (eventCoordinates && eventCoordinates.x && eventCoordinates.y) {
    const label = `
      🎉 אירוע<br>
      🆔 Event ID: ${EVENT_ID}<br>
      📍 מיקום: ${eventLocation}
    `;

    const marker = L.marker([eventCoordinates.y, eventCoordinates.x], {
      icon: icons.eventLocation,
    }).addTo(map);

    marker.bindPopup(label);
  }
}

function loadRideData(eventID) {
  ajaxCall(
    "POST",
    `https://proj.ruppin.ac.il/igroup2/prod/api/RideMatchers?id=${eventID}`,
    null,
    (data) => {
      console.log("✅ Success loading data", data);
      addGiveRideMarkers(data.giveRideRequests);
      addRideRequestMarkers(data.rideRequests);
      addEventMarker(data.eventCoordinates, data.eventLocation);
    },
    (err) => {
      console.error("❌ Error loading data", err);
    }
  );
}

$(document).ready(function () {
  const eventID = 15;
  //loadRideData(eventID);
});
// פונקציה לבחירת סוג הפין (נהג, נוסע, מיקום אירוע)
function selectMarkerType(type) {
  selectedMarkerType = type;
  console.log(`🎯 סוג פינג נבחר: ${type}`);
}
// פונקציה להוספת פין למפה
// הוספת פין למפה עם מידע על מיקום, סוג הפין והכפתור שנלחץ
map.on("click", function (e) {
  if (selectMarkerType == "eventLocation") {
    NumOfEvents++;
    if (NumOfEvents > 1) {
      alert("לא ניתן להוסיף יותר מאירוע אחד.");
      return;
    }
  }
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  console.log(`📍 לחצת במיקום: Latitude: ${lat}, Longitude: ${lng}`);
  let label = "";

  if (selectedMarkerType === "rideRequest") {
    const rideRequest = {
      id: currentRequestID++,
      eventID: EVENT_ID,
      personID: currentPersonID++,
      numOfGuest: 1,
      pickUpLocation: "dummy_location",
      preferredGender: "N",
      preferredSmoker: false,
      pickUpCoordinates: {
        x: lng,
        y: lat,
      },
    };

    label = `
    🧑 נוסע<br>
    📄 Request ID: ${rideRequest.id}<br>
    🧍 Person ID: ${rideRequest.personID}
  `;

    rideRequests.push(rideRequest);
    console.log("🚗 נוסע נוסף:", rideRequest);

    addMarker(lat, lng, label, "rideRequest");
  } else if (selectedMarkerType === "giveRideRequest") {
    const giveRideRequest = {
      id: currentRequestID++,
      eventID: EVENT_ID,
      personID: currentPersonID++,
      carCapacity: 4,
      rideExitPoint: "dummy_exit",
      preferredGender: "N",
      preferredSmoker: false,
      rideExitCoordinates: {
        x: lng,
        y: lat,
      },
    };

    label = `
    🚙 נהג<br>
    📄 Request ID: ${giveRideRequest.id}<br>
    🧍 Person ID: ${giveRideRequest.personID}
  `;

    giveRideRequests.push(giveRideRequest);
    console.log("🚙 נהג נוסף:", giveRideRequest);

    addMarker(lat, lng, label, "giveRideRequest");
  } else if (selectedMarkerType === "eventLocation") {
    event = {
      eventID: EVENT_ID,
      partnerID1: -1,
      partnerID2: -2,
      eventDesc: "אירוע לדוגמה",
      numOfGuest: 100,
      eventDate: new Date().toISOString(),
      eventLocation: "אולם לדוגמה",
      eventLatitude: lat,
      eventLongitude: lng,
    };

    label = `
    🎉 אירוע<br>
    🆔 Event ID: ${EVENT_ID}
  `;

    console.log("📅 מיקום אירוע עודכן:", event);

    addMarker(lat, lng, label, "eventLocation");
  }
});

// שלב ראשון
// פונקציה לסינון אלגוריתם
function filterAlgo() {
  sendToServer();
}

// פונקציה לשליחה לשרת,יצירת אובייקט עם כל המידע הנדרש
// והפונקציה ajaxCall לשליחה לשרת
function sendToServer() {
  const rideMatcher = {
    giveRideRequests: giveRideRequests,
    rideRequests: rideRequests,
    eventLocation: event.eventLocation,
    eventCoordinates: {
      x: event.eventLongitude,
      y: event.eventLatitude,
    },
  };

  // שליחת הנתונים לשרת,למחלקת הריידמאצ'ר
  // והפונקציה ajaxCall לשליחה לשרת
  ajaxCall(
    "POST",
    "https://proj.ruppin.ac.il/igroup2/prod/api/RideMatchers/Filter",
    JSON.stringify(rideMatcher),
    (data) => {
      console.log("🎯 תוצאה לאחר סינון ראשוני:", data);
      runAlgorithm(data);
    },
    (err) => {
      console.error("❌ שגיאה בשליחה לשרת:", err);
    }
  );
}

// פונקציה להרצת האלגוריתם
// חישוב זמן סטייה עבור כל צמד (נהג, נוסע) והחזרת התוצאות לשרת
// מחזירה את התוצאות לשרת עם סטיית זמן עבור כל צמד (נהג, נוסע)
function runAlgorithm(data) {
  console.log("🚀 הפעלת אלגוריתם עם הנתונים:", data);

  const eventCoords = {
    lat: event.eventLatitude,
    lng: event.eventLongitude,
  };

  // חישוב זמן סטייה עבור כל צמד (נהג, נוסע)
  const detourResults = [];
  let pairsCompleted = 0;

  const totalPairs = data.reduce((sum, match) => {
    return sum + (match.potentialRiders?.length || 0);
  }, 0);

  if (totalPairs === 0) {
    console.warn("⚠️ אין מספיק צמדים לחישוב");
    return;
  }
  // לולאה על כל צמד (נהג, נוסע)
  // חישוב זמן סטייה עבור כל צמד (נהג, נוסע)
  data.forEach((matchResult) => {
    const driver = matchResult.driver;

    const origin = {
      lat: driver.rideExitCoordinates.y,
      lng: driver.rideExitCoordinates.x,
    };

    const destination = eventCoords;
    // חישוב זמן מסלול רגיל (נהג לאירוע)
    calculateBaseRouteTime(origin, destination, (baseTime) => {
      (matchResult.potentialRiders || []).forEach((rider) => {
        const waypoint = {
          lat: rider.pickUpCoordinates.y,
          lng: rider.pickUpCoordinates.x,
        };
        // חישוב זמן מסלול עם עצירה (נהג, נוסע לאירוע)
        calculateRouteWithWaypoint(
          origin,
          waypoint,
          destination,
          (detourTime) => {
            let detourMinutes = detourTime - baseTime;
            if (detourMinutes < 0) {
              detourMinutes = 0;
            }
            // חישוב זמן סטייה בדקות
            detourResults.push({
              GiveRideRequests: driver,
              RideRequests: rider,
              detourMinutes: detourMinutes,
            });
            // הוספת התוצאה לצמדים
            pairsCompleted++;
            if (pairsCompleted === totalPairs) {
              console.log("📦 סיימנו לחשב את כל הצמדים, שולחים לשרת...");
              console.log("📦 תוצאות הסטייה:", detourResults);
              sendDetourResultsToServer(detourResults); // שליחה בפועל
            }
          }
        );
      });
    });
  });
}

function calculateBaseRouteTime(origin, destination, callback) {
  const service = new google.maps.DirectionsService();
  service.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(), // תנועה חיה
      },
    },
    (response, status) => {
      if (status === "OK") {
        const duration = response.routes[0].legs[0].duration.value;
        callback(duration / 60); // דקות
      } else {
        console.error("❌ שגיאה במסלול רגיל:", status);
        callback(0);
      }
    }
  );
}

function calculateRouteWithWaypoint(origin, waypoint, destination, callback) {
  const service = new google.maps.DirectionsService();
  service.route(
    {
      origin: origin,
      destination: destination,
      waypoints: [{ location: waypoint }],
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(), // תנועה חיה
      },
    },
    (response, status) => {
      if (status === "OK") {
        let totalSeconds = 0;
        response.routes[0].legs.forEach((leg) => {
          totalSeconds += leg.duration.value;
        });
        callback(totalSeconds / 60); // דקות
      } else {
        console.error("❌ שגיאה במסלול עם עצירה:", status);
        callback(0);
      }
    }
  );
}

function renderMatchResultsTable(matchResults) {
  const container = document.getElementById("matchResultsContainer");
  container.innerHTML = ""; // ניקוי תוכן קודם

  // כותרת
  const title = document.createElement("h3");
  title.innerText = " שיבוצים סופיים";
  container.appendChild(title);

  // יצירת טבלה
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.marginTop = "10px";

  // יצירת שורת כותרות
  const headerRow = document.createElement("tr");
  const headers = ["מזהה נהג", "מזהה נוסע", "סטייה בדקות"];
  for (let i = 0; i < headers.length; i++) {
    const th = document.createElement("th");
    th.innerText = headers[i];
    th.style.border = "1px solid #ccc";
    th.style.padding = "8px";
    th.style.backgroundColor = "#f2f2f2";
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // יצירת שורות הנתונים
  for (let i = 0; i < matchResults.length; i++) {
    const match = matchResults[i];

    const driverId = match.giveRideRequests ? match.giveRideRequests.id : "—";
    const riderId = match.rideRequests ? match.rideRequests.id : "—";
    const detour =
      typeof match.detourMinutes === "number"
        ? match.detourMinutes.toFixed(2)
        : "—";

    const row = document.createElement("tr");

    [driverId, riderId, detour].forEach((value) => {
      const td = document.createElement("td");
      td.innerText = value;
      td.style.border = "1px solid #ccc";
      td.style.padding = "8px";
      row.appendChild(td);
    });

    table.appendChild(row);
  }

  container.appendChild(table);
}

// החלפת הכרטיסיות
function showTab(tabName) {
  const tabs = ["initial", "final"];

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const content = document.getElementById(tab + "Tab");
    const button = document.querySelector(
      `button[onclick="showTab('${tab}')"]`
    );

    if (tab === tabName) {
      content.style.display = "block";
      button.classList.add("active");
    } else {
      content.style.display = "none";
      button.classList.remove("active");
    }
  }
}

// פונקצית הטבלאות
function renderInitialResultsTable(results) {
  const container = document.getElementById("initialResultsContainer");
  container.innerHTML = "";

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  const headerRow = document.createElement("tr");
  const headers = ["מזהה נהג", "מזהה נוסע", "סטייה בדקות"];
  for (let i = 0; i < headers.length; i++) {
    const th = document.createElement("th");
    th.innerText = headers[i];
    th.style.border = "1px solid #ccc";
    th.style.padding = "8px";
    th.style.backgroundColor = "#f2f2f2";
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  for (let i = 0; i < results.length; i++) {
    const match = results[i];

    const driverId = match.GiveRideRequests ? match.GiveRideRequests.id : "—";
    const riderId = match.RideRequests ? match.RideRequests.id : "—";

    const detour =
      typeof match.detourMinutes === "number"
        ? match.detourMinutes.toFixed(2)
        : "—";

    const row = document.createElement("tr");

    [driverId, riderId, detour].forEach((value) => {
      const td = document.createElement("td");
      td.innerText = value;
      td.style.border = "1px solid #ccc";
      td.style.padding = "8px";
      row.appendChild(td);
    });

    table.appendChild(row);
  }

  container.appendChild(table);
}

$(document).ready(function () {
  const eventID = 15;
  //loadRideData(eventID);
});
