// 📦 כל קובץ map.js החדש והמסודר:

const api = "https://localhost:7035/api/";
const eventID = 15; // הארדקוד לפי בקשה
let loadedData = null;

const map = L.map("map", {
  center: [31.0461, 34.8516],
  zoom: 7,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "",
}).addTo(map);

const markersCluster = L.markerClusterGroup();

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

function addMarker(lat, lng, label, type) {
  const marker = L.marker([lat, lng], { icon: icons[type] }).bindPopup(label);
  markersCluster.addLayer(marker);
}

function addGiveRideMarkers(giveRideRequests) {
  giveRideRequests.forEach((giveRide) => {
    if (giveRide.rideExitCoordinates?.x && giveRide.rideExitCoordinates?.y) {
      const label = `🚙 נהג<br>📄 Request ID: ${giveRide.id}<br>🧍 Person ID: ${giveRide.personID}`;
      addMarker(
        giveRide.rideExitCoordinates.y,
        giveRide.rideExitCoordinates.x,
        label,
        "giveRideRequest"
      );
    }
  });
}

function addRideRequestMarkers(rideRequests) {
  rideRequests.forEach((ride) => {
    if (ride.pickUpCoordinates?.x && ride.pickUpCoordinates?.y) {
      const label = `🧑 נוסע<br>📄 Request ID: ${ride.id}<br>🧍 Person ID: ${ride.personID}`;
      addMarker(
        ride.pickUpCoordinates.y,
        ride.pickUpCoordinates.x,
        label,
        "rideRequest"
      );
    }
  });
}

function addEventMarker(eventCoordinates, eventLocation) {
  if (eventCoordinates?.x && eventCoordinates?.y) {
    const label = `🎉 אירוע<br>📍 מיקום: ${eventLocation}`;
    addMarker(eventCoordinates.y, eventCoordinates.x, label, "eventLocation");
  }
}

function loadRideData(eventID) {
  $("#loading").show();
  $("#c").hide();

  ajaxCall(
    "POST",
    api + `RideMatchers?id=${eventID}`,
    null,
    (data) => {
      console.log("✅ Success loading data", data);
      loadedData = data;

      if (
        (!data.giveRideRequests || data.giveRideRequests.length === 0) &&
        (!data.rideRequests || data.rideRequests.length === 0)
      ) {
        $("#loading").text("❌ אין מוזמנים לאירוע זה.");
        return;
      }

      addGiveRideMarkers(data.giveRideRequests);
      addRideRequestMarkers(data.rideRequests);
      addEventMarker(data.eventCoordinates, data.eventLocation);

      map.addLayer(markersCluster);
      $("#loading").hide();
      $("#c").show();
    },
    (err) => {
      console.error("❌ Error loading data", err);
      $("#loading").text("❌ שגיאה בטעינת הנתונים.");
    }
  );
}

// אלגוריתם:
function filterAlgo() {
  sendToServer();
}

function sendToServer() {
  const rideMatcher = {
    giveRideRequests: loadedData.giveRideRequests,
    rideRequests: loadedData.rideRequests,
    eventLocation: loadedData.eventLocation,
    eventCoordinates: loadedData.eventCoordinates,
  };

  ajaxCall(
    "POST",
    api + "RideMatchers/Filter",
    JSON.stringify(rideMatcher),
    (data) => {
      console.log("🎯 סינון ראשוני הושלם:", data);
      runAlgorithm(data);
    },
    (err) => {
      console.error("❌ שגיאה בסינון:", err);
    }
  );
}

function runAlgorithm(data) {
  console.log("🚀 הפעלת אלגוריתם חישוב סטייה...");

  const eventCoords = {
    lat: loadedData.eventCoordinates.y,
    lng: loadedData.eventCoordinates.x,
  };

  const detourResults = [];
  let pairsCompleted = 0;

  const totalPairs = data.reduce(
    (sum, match) => sum + (match.potentialRiders?.length || 0),
    0
  );

  if (totalPairs === 0) {
    console.warn("⚠️ אין מספיק צמדים לחישוב");
    return;
  }

  data.forEach((matchResult) => {
    const driver = matchResult.driver;
    const origin = {
      lat: driver.rideExitCoordinates.y,
      lng: driver.rideExitCoordinates.x,
    };
    const destination = eventCoords;

    calculateBaseRouteTime(origin, destination, (baseTime) => {
      (matchResult.potentialRiders || []).forEach((rider) => {
        const waypoint = {
          lat: rider.pickUpCoordinates.y,
          lng: rider.pickUpCoordinates.x,
        };
        calculateRouteWithWaypoint(
          origin,
          waypoint,
          destination,
          (detourTime) => {
            let detourMinutes = detourTime - baseTime;
            if (detourMinutes < 0) detourMinutes = 0;

            detourResults.push({
              GiveRideRequests: driver,
              RideRequests: rider,
              detourMinutes: detourMinutes,
            });

            pairsCompleted++;
            if (pairsCompleted === totalPairs) {
              console.log("📦 סיימנו חישוב סטיות, שולחים תוצאות...");
              sendDetourResultsToServer(detourResults);
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
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: { departureTime: new Date() },
    },
    (response, status) => {
      if (status === "OK") {
        const duration = response.routes[0].legs[0].duration.value;
        callback(duration / 60);
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
      origin,
      destination,
      waypoints: [{ location: waypoint }],
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: { departureTime: new Date() },
    },
    (response, status) => {
      if (status === "OK") {
        let totalSeconds = 0;
        response.routes[0].legs.forEach((leg) => {
          totalSeconds += leg.duration.value;
        });
        callback(totalSeconds / 60);
      } else {
        console.error("❌ שגיאה במסלול עם עצירה:", status);
        callback(0);
      }
    }
  );
}

function sendDetourResultsToServer(results) {
  renderInitialResultsTable(results);
  console.log("📦 שולחים סטיות לשרת:", results);

  ajaxCall(
    "POST",
    api + `Algos/RunAlgo?Eventid=${eventID}`,
    JSON.stringify(results),
    (data) => {
      console.log("✅ שיבוץ סופי התקבל:", data);
      renderMatchResultsTable(data);
    },
    (err) => {
      console.error("❌ שגיאה בשיבוץ:", err);
    }
  );
}

function renderInitialResultsTable(results) {
  const container = document.getElementById("initialResultsContainer");
  container.innerHTML = "";

  const table = createTable(["מזהה נהג", "מזהה נוסע", "סטייה בדקות"]);

  for (let match of results) {
    const row = [
      match.GiveRideRequests?.id || "—",
      match.RideRequests?.id || "—",
      typeof match.detourMinutes === "number"
        ? match.detourMinutes.toFixed(2)
        : "—",
    ];
    addRowToTable(table, row);
  }

  container.appendChild(table);
}

function renderMatchResultsTable(results) {
  const container = document.getElementById("matchResultsContainer");
  container.innerHTML = "";

  const table = createTable(["מזהה נהג", "מזהה נוסע", "סטייה בדקות"]);

  for (let match of results) {
    const row = [
      match.giveRideRequests?.id || "—",
      match.rideRequests?.id || "—",
      typeof match.detourMinutes === "number"
        ? match.detourMinutes.toFixed(2)
        : "—",
    ];
    addRowToTable(table, row);
  }

  container.appendChild(table);
}

function createTable(headers) {
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.marginTop = "10px";

  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.innerText = header;
    th.style.border = "1px solid #ccc";
    th.style.padding = "8px";
    th.style.backgroundColor = "#f2f2f2";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  return table;
}

function addRowToTable(table, rowData) {
  const row = document.createElement("tr");
  rowData.forEach((cellData) => {
    const td = document.createElement("td");
    td.innerText = cellData;
    td.style.border = "1px solid #ccc";
    td.style.padding = "8px";
    row.appendChild(td);
  });
  table.appendChild(row);
}

// טעינה עם מפת ישראל בלבד + Google Maps
function waitForGoogleMapsReady(callback) {
  if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
    callback();
  } else {
    console.log("🕒 ממתין לטעינת Google Maps...");
    setTimeout(() => waitForGoogleMapsReady(callback), 300);
  }
}

$(document).ready(function () {
  map.whenReady(function () {
    waitForGoogleMapsReady(() => {
      console.log("🗺️ המפה + Google Maps מוכנים - טוען מוזמנים...");
      loadRideData(eventID);
    });
  });
});

function showTab(tabName) {
  const initialTab = document.getElementById("initialTab");
  const finalTab = document.getElementById("finalTab");

  // הסתר את שניהם
  initialTab.style.display = "none";
  finalTab.style.display = "none";

  // הסר highlight מהכפתורים
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // הצג את הטאב שנבחר והדגש את הכפתור שלו
  if (tabName === "initial") {
    initialTab.style.display = "block";
    document
      .querySelector("button[onclick=\"showTab('initial')\"]")
      .classList.add("active");
  } else if (tabName === "final") {
    finalTab.style.display = "block";
    document
      .querySelector("button[onclick=\"showTab('final')\"]")
      .classList.add("active");
  }
}
