//const eventID = 1077; // הארדקוד לפי בקשה
const eventID = localStorage.getItem("eventID");

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
    const label = `🚙 נהג<br>📄 Request ID: ${giveRide.id}<br>🧍 Person ID: ${giveRide.personID}`;

    if (giveRide.Latitude && giveRide.Longitude) {
      addMarker(
        giveRide.Latitude,
        giveRide.Longitude,
        label,
        "giveRideRequest"
      );
    } else {
      geocodeAndAddMarker(giveRide.rideExitPoint, label, "giveRideRequest");
    }
  });
}
function addRideRequestMarkers(rideRequests) {
  rideRequests.forEach((ride) => {
    const name = ride.FullName || ride.fullName || ride.fullname || "—";
    const label = `🧑 נוסע<br>📄 Request ID: ${ride.id}<br>🧍 Person ID: ${ride.personID}
    <br>🧍 Name : ${name}`;

    if (ride.Latitude && ride.Longitude) {
      addMarker(ride.Latitude, ride.Longitude, label, "rideRequest");
    } else {
      geocodeAndAddMarker(ride.pickUpLocation, label, "rideRequest");
    }
  });
}

function geocodeAndAddMarker(address, label, type) {
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      const location = results[0].geometry.location;
      addMarker(location.lat(), location.lng(), label, type);
    } else {
      console.warn(`⚠️ לא ניתן למקם כתובת: ${address}`, status);
    }
  });
}

function addEventMarker(eventCoordinates, eventLocation) {
  const label = `🎉 אירוע<br>📍 מיקום: ${eventLocation}`;

  // בדיקה לפי eventLatitude / eventLongitude שהגיעו מ־loadedData
  if (loadedData.eventLatitude && loadedData.eventLongitude) {
    addMarker(
      loadedData.eventLatitude,
      loadedData.eventLongitude,
      label,
      "eventLocation"
    );
  } else {
    geocodeAndAddMarker(eventLocation, label, "eventLocation");
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

      // הוספת קואורדינטות ישירות ל-loadedData עבור שימוש נוח בהמשך
      if (data.eventCoordinates) {
        loadedData.eventLatitude = data.eventCoordinates.y;
        loadedData.eventLongitude = data.eventCoordinates.x;
      }

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
    EventLongitude: loadedData.eventLongitude,
    EventLatitude: loadedData.eventLatitude,
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
    lat: parseFloat(loadedData.eventLatitude), // Latitude → lat (✔️)
    lng: parseFloat(loadedData.eventLongitude), // Longitude → lng (✔️)
  };

  console.log("📍 מיקום האירוע:", eventCoords);

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
      lat: parseFloat(driver.latitude),
      lng: parseFloat(driver.longitude),
    };

    const destination = {
      lat: parseFloat(loadedData.eventLatitude), // latitude
      lng: parseFloat(loadedData.eventLongitude), // longitude
    };

    // בדיקת קואורדינטות נהג ויעד
    if (
      isNaN(origin.lat) ||
      isNaN(origin.lng) ||
      isNaN(destination.lat) ||
      isNaN(destination.lng)
    ) {
      console.warn("⚠️ קואורדינטות נהג/אירוע לא תקינות!", {
        origin,
        destination,
      });
      return;
    }

    console.log(
      `🚗 נהג: ${driver.id} (${driver.latitude}, ${driver.longitude})`
    );

    calculateBaseRouteTime(origin, destination, (baseTime) => {
      (matchResult.potentialRiders || []).forEach((rider) => {
        const waypoint = {
          lat: parseFloat(rider.latitude),
          lng: parseFloat(rider.longitude),
        };

        // בדיקת קואורדינטות נוסע
        if (isNaN(waypoint.lat) || isNaN(waypoint.lng)) {
          console.warn("⚠️ קואורדינטות נוסע לא תקינות!", waypoint);
          return;
        }

        console.log("🚀 בדיקה מהירה");
        console.log("eventCoords:", eventCoords);
        console.log("origin:", origin);
        console.log("waypoint:", waypoint);

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
      insertPassengersToDataBase(data);
    },
    (err) => {
      console.error("❌ שגיאה בשיבוץ:", err);
    }
  );
}

function insertPassengersToDataBase(data) {
  const passengersInRideList = [];

  data.forEach((match) => {
    if (match.giveRideRequests?.id && match.rideRequests?.personID) {
      passengersInRideList.push({
        DriverID: match.giveRideRequests.personID,
        passengerID: match.rideRequests.personID,
        eventID: eventID, // ✅ הוספנו את מספר האירוע
        RideStatus: "PendingDriver", // ✅ הוספה חובה כדי למנוע שגיאה
      });
    }
  });

  console.log("📤 שולח לשמירה ב-DB:", passengersInRideList);

  ajaxCall(
    "POST",
    api + "Rides",
    JSON.stringify(passengersInRideList),
    (res) => {
      console.log("✅ נשמרו שיבוצים במסד:", res);
      Swal.fire("הצלחה!", "השיבוץ הסופי נשמר במסד הנתונים.", "success", {
        confirmButtonColor: "#f06292",
        reverseButtons: true,
      });
    },
    (err) => {
      console.error("❌ שגיאה בשמירה:", err);

      // הוספת שורת פענוח השגיאה
      if (err?.responseText) {
        console.warn("📄 תוכן השגיאה:", err.responseText);
      }

      Swal.fire("שגיאה", "לא ניתן לשמור את השיבוצים.", "error", {
        confirmButtonColor: "#f06292",
        reverseButtons: true,
      });
    }
  );
}

function renderInitialResultsTable(results) {
  const container = document.getElementById("initialResultsContainer");
  container.innerHTML = "";

  const table = createTable(["מזהה נהג", "מזהה נוסע", "סטייה בדקות"]);

  for (let match of results) {
    const row = [
      match.GiveRideRequests?.personID || "—",
      match.RideRequests?.personID || "—",
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
      match.giveRideRequests?.personID || "—",
      match.rideRequests?.personID || "—",
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

  // הסר highlight מהטאבים העדינים
  document.querySelectorAll(".table-tab").forEach((btn) => {
    btn.classList.remove("active");
  });

  // הצג את הטאב שנבחר והדגש את הכפתור שלו
  if (tabName === "initial") {
    initialTab.style.display = "block";
    document
      .querySelector(".table-tab[onclick=\"showTab('initial')\"]")
      .classList.add("active");
  } else if (tabName === "final") {
    finalTab.style.display = "block";
    document
      .querySelector(".table-tab[onclick=\"showTab('final')\"]")
      .classList.add("active");
  }
}
