using System;
using System.Collections.Generic;
using System.Linq;
using static Get2Gether.Models.RideMatcher;

namespace Get2Gether.Models
{
    public class Algo
    {
       // private DBservices db = new DBservices();


        private readonly Dictionary<string, int> weights = new Dictionary<string, int>
        {
            { "distance", 40 },
            { "smoking", 20 },
            { "gender", 20 },
            { "proximity", 20 }
        };
        // בני: מעשן , גבר , צד כלה, מרחק: סטייה 7%
        //public List<MatchResult> RunAlgorithm(List<MatchResult> filterResult)
        //{
        //    var finalMatches = new List<MatchResult>();

        //    foreach (var match in filterResult)
        //    {
        //        GiveRideRequest driver = match.Driver;
        //        var bestRiders = new List<(RideRequest Rider, double score)>();

        //        foreach (var Rider in match.PotentialRiders)
        //        {
        //            double score = CalculateOverallScore(driver, Rider);
        //            if (score != -1)
        //            {
        //                bestRiders.Add((Rider, score));
        //            }
        //        }

        //        var topRiders = bestRiders.OrderByDescending(p => p.score).Take(3).Select(p => p.Rider)
        //            .ToList();

        //        finalMatches.Add(new MatchResult
        //        {
        //            Driver = driver,
        //            PotentialRiders = topRiders
        //        });
        //    }

        //    return finalMatches;
        //}

        //private double CalculateOverallScore(List<FinalMatch> matches)
        //{
        //    List<FinalMatch> distanceScore = CalculateDistanceScore(matches, 10);

        //    ///// צריך לעשות שרוול שישלוף את האנשים
        //    //Person TheDriver = db.GetPerson(driver.PersonID);
        //    //Person TheRider = db.GetPerson(rider.PersonID);



        //    //int smokingScore = CalculateSmokingScore(driver, TheDriver, rider, TheRider);
        //    //int genderScore = CalculateGenderScore(driver, TheDriver, rider, TheRider);
        //    //int proximityScore = CalculateProximityScore(TheDriver, TheRider);

        //    //return distanceScore * (weights["distance"] / 100.0);
        //    //distanceScore * (weights["distance"] / 100.0) +
        //    //smokingScore * (weights["smoking"] / 100.0) +
        //    //genderScore * (weights["gender"] / 100.0) +
        //    //proximityScore * (weights["proximity"] / 100.0);
        //}


        // מתבצע סינון: רק צמדים שבהם זמן הסטייה קטן מהמותר נכנסים להמשך שיקול.
        public List<FinalMatch> CalculateDistanceScore(List<FinalMatch> matches, double maxAllowedDeviation)
        {
            List<FinalMatch> finalMatch = new List<FinalMatch>();
            foreach (var match in matches)
            {
                if (match.detourMinutes < maxAllowedDeviation)
                {
                    finalMatch.Add(match);
                }
            }

            return ProtectTheLonely(finalMatch);
        }




        private int CalculateSmokingScore(GiveRideRequest driver, Person driverPerson, RideRequest rider, Person riderPerson)
        {
            int driverScore = 100;
            int riderScore = 100;

            // חישוב לפי העדפת הנהג
            if (driver.PreferredSmoker == true)
            {
                if (riderPerson.Smoke == true)
                {
                    driverScore = 0;// לנהג מפריע שיש נוסע מעשן ונוסע מעשן
                }
                else
                {
                    driverScore = 100;
                }
            }
            else if (driver.PreferredSmoker == false)
            {
                // אין לנהג בעיה עם עישון – ברירת מחדל נשארת 100
                driverScore = 100;
            }

            // חישוב לפי העדפת הטרמפיסט
            if (rider.PreferredSmoker == true)
            {
                if (driverPerson.Smoke == true)
                {
                    riderScore = 50; // לנוסע מפריע עישון והנהג מעשן
                }
                else
                {
                    riderScore = 100; // לנוסע מפריע עישון והנהג לא מעשן
                }
            }
            else if (rider.PreferredSmoker == false)
            {
                // אין העדפה לנוסע – ברירת מחדל נשארת 100
                riderScore = 100;
            }

            int averageScore = (driverScore + riderScore) / 2;
            return averageScore;
        }



        private int CalculateGenderScore(GiveRideRequest driver, Person driverPerson, RideRequest rider, Person riderPerson)
        {
            string driverPref = driver.PreferredGender;
            string riderPref = rider.PreferredGender;
            string driverGender = driverPerson.Gender;
            string riderGender = riderPerson.Gender;

            // אם לשניהם אין העדפה
            if (driverPref == "N" && riderPref == "N")
                return 100;

            // אם לשניהם יש העדפה ברורה
            if (driverPref != "N" && riderPref != "N")
            {
                if (driverPref == riderGender && riderPref == driverGender)
                    return 100; // התאמה מלאה
                else if (driverPref == riderGender || riderPref == driverGender)
                    return 50;  // התאמה חלקית
                else
                    return 0;   // אין התאמה
            }

            // רק לנהג יש העדפה
            if (driverPref != "N")
            {
                if (driverPref == riderGender)
                    return 100;
                else
                    return 50;
            }

            // רק לנוסע יש העדפה
            if (riderPref != "N")
            {
                if (riderPref == driverGender)
                    return 100;
                else
                    return 50;
            }

            // ברירת מחדל (לא אמור להגיע לכאן, אבל ליתר ביטחון)
            return 100;
        }


        private int CalculateProximityScore(Person driverPerson, Person riderPerson)
        {
            if (driverPerson.SideInWedding != riderPerson.SideInWedding && driverPerson.RelationToCouple != riderPerson.RelationToCouple)
                return 0;

            if (driverPerson.SideInWedding == riderPerson.SideInWedding || driverPerson.RelationToCouple == riderPerson.RelationToCouple)
                return (int)((2.0 / 4.0) * 100);

            return 100;
        }



        // נמצא את הטרמפיסטים המסכנים
        public List<FinalMatch> ProtectTheLonely(List<FinalMatch> allMatches)
        {
            // תוצאה סופית - רשימת השיבוצים שנחזיר בסוף
            List<FinalMatch> finalResults = new List<FinalMatch>();

            // התאמות שננעלו - מסכנים שיש להם רק אופציה אחת
            List<FinalMatch> lockedMatches = new List<FinalMatch>();

            // רשימת מזהים של נהגים ונוסעים שננעלו (כדי לא לשבץ אותם שוב)
            List<int> lockedDriverIds = new List<int>();
            List<int> lockedRiderIds = new List<int>();

            // שלב 1: חיפוש נוסעים עם התאמה אחת בלבד (המסכנים)
            for (int i = 0; i < allMatches.Count; i++)
            {
                FinalMatch match = allMatches[i];
                int riderId = match.RideRequests.Id;
                int count = 0;

                // סופרים כמה התאמות יש לנוסע הזה
                for (int j = 0; j < allMatches.Count; j++)
                {
                    if (allMatches[j].RideRequests.Id == riderId)
                    {
                        count++;
                    }
                }

                // אם יש לו רק אופציה אחת - נועלים אותו
                if (count == 1)
                {
                    lockedMatches.Add(match);
                    lockedDriverIds.Add(match.GiveRideRequests.Id);
                    lockedRiderIds.Add(match.RideRequests.Id);
                    finalResults.Add(match);
                }
            }

            // שלב 2: איסוף כל הנהגים המופיעים ברשימה
            List<int> allDriverIds = new List<int>();
            for (int i = 0; i < allMatches.Count; i++)
            {
                int driverId = allMatches[i].GiveRideRequests.Id;

                // רק אם עוד לא אספנו את הנהג הזה
                if (!allDriverIds.Contains(driverId))
                {
                    allDriverIds.Add(driverId);
                }
            }

            // שלב 3: לכל נהג שלא ננעל, נבחר עד 5 התאמות הכי טובות שלא כוללות נוסעים שננעלו
            for (int i = 0; i < allDriverIds.Count; i++)
            {
                int driverId = allDriverIds[i];

                // אם הנהג כבר ננעל עם מסכן - מדלגים עליו
                if (lockedDriverIds.Contains(driverId))
                {
                    continue;
                }

                // אוספים את כל ההתאמות של הנהג הזה, רק עם נוסעים שעדיין לא ננעלו
                List<FinalMatch> matchesForDriver = new List<FinalMatch>();
                for (int j = 0; j < allMatches.Count; j++)
                {
                    FinalMatch match = allMatches[j];
                    if (match.GiveRideRequests.Id == driverId)
                    {
                        matchesForDriver.Add(match);
                    }
                }

                // שלב 4: מיון ההתאמות לפי detourMinutes (מהקטן לגדול)
                for (int x = 0; x < matchesForDriver.Count - 1; x++)
                {
                    for (int y = x + 1; y < matchesForDriver.Count; y++)
                    {
                        if (matchesForDriver[x].detourMinutes > matchesForDriver[y].detourMinutes)
                        {
                            FinalMatch temp = matchesForDriver[x];
                            matchesForDriver[x] = matchesForDriver[y];
                            matchesForDriver[y] = temp;
                        }
                    }
                }

                // שלב 5: הוספת עד 5 התאמות הכי טובות לנהג הזה
                int addedCount = 0;
                for (int k = 0; k < matchesForDriver.Count && addedCount < 5; k++)
                {
                    finalResults.Add(matchesForDriver[k]);
                    addedCount++;
                }
            }

            // מחזירים את השיבוצים הסופיים (כולל מסכנים ונוספים)
            return finalResults;
        }




    }


}
