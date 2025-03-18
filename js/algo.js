function matchPassengersToDrivers(
  drivers,
  passengers,
  weights = { distance: 40, smoking: 20, gender: 20, proximity: 20 }
) {
  function calculateDistanceScore(driver, passenger, maxAllowedDeviation = 10) {
    let distance = getDistanceFromAPI(driver.location, passenger.location);

    if (distance > maxAllowedDeviation) {
      return -1;
    }

    let deviation = (distance / maxAllowedDeviation) * 100;
    return 100 - deviation;
  }

  function calculateSmokingScore(driver, passenger) {
    if (
      driver.smokingPreference === "any" &&
      passenger.smokingPreference === "any"
    ) {
      return 100;
    }
    if (
      driver.smokingPreference !== "any" &&
      passenger.smokingPreference !== "any"
    ) {
      if (
        (driver.smokingPreference === "yes" && passenger.smokes) ||
        (driver.smokingPreference === "no" && !passenger.smokes)
      ) {
        if (
          (passenger.smokingPreference === "yes" && driver.smokes) ||
          (passenger.smokingPreference === "no" && !driver.smokes)
        ) {
          return 100;
        }
        return 0;
      }
      return 0;
    }
    if (
      driver.smokingPreference !== "any" ||
      passenger.smokingPreference !== "any"
    ) {
      if (
        (driver.smokingPreference === "yes" && passenger.smokes) ||
        (driver.smokingPreference === "no" && !passenger.smokes)
      ) {
        return 100;
      } else {
        return 50;
      }
    }
    return 100;
  }

  function calculateGenderScore(driver, passenger) {
    if (
      driver.genderPreference === "any" &&
      passenger.genderPreference === "any"
    ) {
      return 100;
    }
    if (
      driver.genderPreference !== "any" &&
      passenger.genderPreference !== "any"
    ) {
      if (
        driver.genderPreference === passenger.gender &&
        passenger.genderPreference === driver.gender
      ) {
        return 100;
      } else {
        return 0;
      }
    }
    if (
      driver.genderPreference !== "any" ||
      passenger.genderPreference !== "any"
    ) {
      if (driver.gender === passenger.gender) {
        return 100;
      } else {
        return 50;
      }
    }
    return 100;
  }

  function calculateProximityScore(driver, passenger) {
    if (
      driver.group !== passenger.group &&
      driver.subgroup !== passenger.subgroup
    ) {
      return 0;
    }
    if (
      driver.group === passenger.group ||
      driver.subgroup === passenger.subgroup
    ) {
      return (2 / 4) * 100;
    }
    return (4 / 4) * 100;
  }

  function calculateOverallScore(driver, passenger) {
    let distanceScore = calculateDistanceScore(driver, passenger);
    if (distanceScore === -1) {
      return -1;
    }

    let smokingScore = calculateSmokingScore(driver, passenger);
    let genderScore = calculateGenderScore(driver, passenger);
    let proximityScore = calculateProximityScore(driver, passenger);

    return (
      distanceScore * (weights.distance / 100) +
      smokingScore * (weights.smoking / 100) +
      genderScore * (weights.gender / 100) +
      proximityScore * (weights.proximity / 100)
    );
  }

  let matches = [];

  for (let i = 0; i < drivers.length; i++) {
    let driver = drivers[i];
    let bestPassengers = [];

    for (let j = 0; j < passengers.length; j++) {
      let passenger = passengers[j];
      let score = calculateOverallScore(driver, passenger);

      if (score !== -1) {
        bestPassengers.push({ passenger, score });
      }
    }

    bestPassengers.sort(function (a, b) {
      return b.score - a.score;
    });
    bestPassengers = bestPassengers.slice(0, 3);

    matches.push({ driver: driver, bestPassengers: bestPassengers });
  }

  return matches;
}
