using System;
using System.Collections.Generic;
using Get2Gether.Models;
namespace Get2Gether.Models;
public class RideMatcher
{
    public List<GiveRideRequest> GiveRideRequests { get; set; }
    public List<RideRequest> RideRequests { get; set; }

    string EventLocation;

    public double EventLongitude { get; set; }
    public double EventLatitude { get; set; }

    private DBservices db = new DBservices();

    public RideMatcher(List<GiveRideRequest> giveRideRequests, List<RideRequest> rideRequests, string eventLocation, double eventLongitude, double eventLatitude)
    {
        GiveRideRequests = giveRideRequests;
        RideRequests = rideRequests;
        EventLocation = eventLocation;
        EventLongitude = eventLongitude;
        EventLatitude = eventLatitude;
    }

    public RideMatcher()
    {
    }


    // מחשבים את המרחק האנכי בין הטרמפסיט לישר של נהג-אירוע
    //סינון ראשוני של מרחק פחות מ2500 מטר
    public List<MatchResult> FilterRideRequests()
    {
        // שליפת קורדינאטות מיקום
        //foreach (var driver in GiveRideRequests)
        // {
        //    driver.RideExitCoordinates = db.GetCoordinatesForCity(driver.RideExitPoint);
        //  }

        //   foreach (var rider in RideRequests)
        //{
        //       rider.PickUpCoordinates = db.GetCoordinatesForCity(rider.PickUpLocation);
        //   }

        //   var eventPoint = db.GetCoordinatesForCity(this.EventLocation);        // מיקום האירוע

        GeoPoint EventCoordinate = new GeoPoint(this.EventLatitude, this.EventLongitude);



        var results = new List<MatchResult>(); // רשימה סופית

        foreach (var driver in GiveRideRequests)
        {
            GeoPoint driverCoordinate = new GeoPoint(driver.Latitude, driver.Longitude);
            var potentialRiders = new List<RideRequest>();

            foreach (var rider in RideRequests)
            {
                GeoPoint riderCoordinate = new GeoPoint(rider.Latitude, rider.Longitude);
                double distance = CalculateDistance(driverCoordinate, EventCoordinate, riderCoordinate);

                if (distance <= 2500)// לבדוק מה מרחק סביר
                {
                    potentialRiders.Add(rider);
                }
            }

            // מחזירים לקליינט מאצ' ריזולט- נהג ורשימת טרמפיסטים לאחר סינון של 2500 מטר
            results.Add(new MatchResult
            {
                Driver = driver,
                PotentialRiders = potentialRiders
            });
        }

        //RunAlgorithm(results);
        return results;
    }

    private double CalculateDistance(GeoPoint A, GeoPoint B, GeoPoint P)
    {

        // ----------------------------
        // 📌 הגדרות קבועות והמרות:
        // ----------------------------

        double earthCircumferenceKm = 40075.0; // היקף כדור הארץ בקו המשווה (בק"מ)
        double degreesPerCircle = 360.0;       // מספר מעלות במעגל שלם

        double earthRadiusKm = 6371.0;         // רדיוס כדור הארץ (לא בשימוש כרגע אבל נפוץ)
        double latKmPerDegree = 111.32;        // מעלה רוחב שווה בקירוב ל־111.32 ק"מ

        double degToRad = Math.PI / 180.0;     // המרה ממעלות לרדיאנים

        // מעלה אורך משתנה לפי קו הרוחב של הנקודה — קירוב לפי קוסינוס
        double cosLatitude = Math.Cos(P.Y * degToRad);
        double lonKmPerDegree = earthCircumferenceKm * cosLatitude / degreesPerCircle;

        // ----------------------------
        // 📌 המרת הקואורדינטות לק"מ:
        // ----------------------------

        double Ax = A.X * lonKmPerDegree;
        double Ay = A.Y * latKmPerDegree;

        double Bx = B.X * lonKmPerDegree;
        double By = B.Y * latKmPerDegree;

        double Px = P.X * lonKmPerDegree;
        double Py = P.Y * latKmPerDegree;

        // ----------------------------
        // 📌 חישוב מרחק מנקודה לישר:
        // ----------------------------

        double numerator = Math.Abs((Bx - Ax) * (Ay - Py) - (Ax - Px) * (By - Ay));
        double denominator = Math.Sqrt(Math.Pow(Bx - Ax, 2) + Math.Pow(By - Ay, 2));

        if (denominator == 0)
            return 0;

        double distanceKm = numerator / denominator;
        double distanceMeters = distanceKm * 1000;

        return distanceMeters;
    }

    /// <summary>
    /// Debug method that creates one driver and three riders with manual coordinates,
    /// runs FilterRideRequests using actual logic, and prints full debug output.
    /// </summary>
    /// 

    /*
    public void PrintDebugUsage()
    {
        Console.WriteLine("----- DEBUG: Full Flow with Multiple Drivers and Riders -----");

        // יצירת אירוע פיקטיבי
        Event e = new Event
        {
            EventLocation = "באר שבע - מרכז"
        };

        var eventPoint = new GeoPoint { X = 31.7683, Y = 35.2137 };
        e.EventLatitude = eventPoint.X;
        e.EventLongitude = eventPoint.Y;

        // 2 נהגים עם נקודות יציאה שונות
        GiveRideRequests = new List<GiveRideRequest>
    {
        new GiveRideRequest
        {
            Id = 1,
            RideExitPoint = "תל אביב - צפון",
            RideExitCoordinates = new GeoPoint { X = 32.0853, Y = 34.7818 } // תל אביב
        },
        new GiveRideRequest
        {
            Id = 2,
            RideExitPoint = "פתח תקווה",
            RideExitCoordinates = new GeoPoint { X = 32.0871, Y = 34.8864 } // פתח תקווה
        }
    };

        RideRequests = new List<RideRequest>
{
    // קרובים לנהג 1 (תל אביב → ירושלים)
    new RideRequest
    {
        Id = 101,
        PickUpLocation = "רמת גן",
        PickUpCoordinates = new GeoPoint { X = 32.0802, Y = 34.8148 } // רמת גן
    },
    new RideRequest
    {
        Id = 102,
        PickUpLocation = "גבעתיים",
        PickUpCoordinates = new GeoPoint { X = 32.0704, Y = 34.8094 } // גבעתיים
    },
    new RideRequest
    {
        Id = 103,
        PickUpLocation = "חולון",
        PickUpCoordinates = new GeoPoint { X = 32.0158, Y = 34.7874 } // חולון
    },

    // קרובים לנהג 2 (פתח תקווה → ירושלים)
    new RideRequest
    {
        Id = 201,
        PickUpLocation = "חולון",
        PickUpCoordinates = new GeoPoint { X = 32.0158, Y = 34.7874 } // חולון
    },
    new RideRequest
    {
        Id = 202,
        PickUpLocation = "בית דגן",
        PickUpCoordinates = new GeoPoint { X = 31.9984, Y = 34.8253 }
    },
    new RideRequest
    {
        Id = 203,
        PickUpLocation = "בית דגן",
        PickUpCoordinates = new GeoPoint { X = 31.9984, Y = 34.8253 }
    }
};





        var results = FilterRideRequests();

        foreach (var result in results)
        {
            Console.WriteLine($"\nDriver ID: {result.Driver.Id} ({result.Driver.RideExitPoint})");

            if (result.PotentialRiders.Count == 0)
            {
                Console.WriteLine(" → No matched riders (all too far)");
            }
            else
            {
                foreach (var rider in result.PotentialRiders)
                {
                    double distance = CalculateDistance(
                        result.Driver.RideExitCoordinates,
                        new GeoPoint { X = e.EventLatitude, Y = e.EventLongitude },
                        rider.PickUpCoordinates);

                    Console.WriteLine($" → Rider ID: {rider.Id} | Pickup: {rider.PickUpLocation} | Distance from route: {distance:F2} km");
                }
            }
        }

        Console.WriteLine("\n----- END DEBUG -----");
        System.Diagnostics.Debug.WriteLine("Text to debug");
    }

    */


    public RideMatcher GetALLRequests(int EventID)
    {
        DBservices db = new DBservices();
        return db.GetALLRequests(EventID);
    }
    public List<string> GetCities()
    {
        DBservices db = new DBservices();
        return db.GetCities();
    }

}