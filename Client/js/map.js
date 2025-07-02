let loadedData = null;
let map; // משתנה גלובלי למפת Google
let markers = []; // נשמור את כל הפינים שהוספנו כדי לנקות אם נרצה

// אתחול Google Maps
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 32.0853, lng: 34.7818 },
    zoom: 10,
  });

  const eventID = localStorage.getItem("eventID");
  if (eventID) {
    loadRideData(eventID);
  } else {
    console.error("❌ eventID לא נמצא בלוקאל סטורג'");
  }
};

// אייקונים מותאמים לפי סוג
const icons = {
  rideRequest: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  giveRideRequest: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  eventLocation: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

// הוספת פין למפה
function addMarker(lat, lng, label, type) {
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: map,
    icon: icons[type],
    title: label.replace(/<br>/g, "\n"),
  });

  const infowindow = new google.maps.InfoWindow({
    content: `<div style="direction: rtl;">${label}</div>`,
  });

  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });

  markers.push(marker);
}

// גיאוקוד לפי כתובת
function geocodeAndAddMarker(address, label, type) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, function (results, status) {
    if (status === "OK") {
      const location = results[0].geometry.location;
      addMarker(location.lat(), location.lng(), label, type);
    } else {
      console.warn(`⚠️ לא ניתן למקם כתובת: ${address}`, status);
    }
  });
}

// יצירת הפינים
function addRideRequestMarkers(rideRequests) {
  rideRequests.forEach((ride) => {
    const label = `🧑 נוסע<br>📄 Request ID: ${ride.id}<br>🧍 Person ID: ${ride.personID}`;
    if (ride.Latitude && ride.Longitude) {
      addMarker(ride.Latitude, ride.Longitude, label, "rideRequest");
    } else {
      geocodeAndAddMarker(ride.pickUpLocation, label, "rideRequest");
    }
  });
}

function addGiveRideMarkers(giveRideRequests) {
  giveRideRequests.forEach((giveRide) => {
    const label = ` 🚙 נהג<br>📄 Request ID: ${giveRide.id}<br>🧍 Person ID: ${giveRide.personID}`;
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

function addEventMarker(eventCoordinates, eventLocation) {
  const label = `🎉 אירוע<br>📍 מיקום: ${eventLocation}`;
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

// שליפת מידע מהשרת
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

      $("#loading").hide();
      $("#c").show();
    },
    (err) => {
      console.error("❌ Error loading data", err);
      $("#loading").text("❌ שגיאה בטעינת הנתונים.");
    }
  );
}
