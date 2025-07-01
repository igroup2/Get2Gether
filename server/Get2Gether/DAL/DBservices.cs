using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;
using static Microsoft.IO.RecyclableMemoryStreamManager;

public class DBservices
{
    public DBservices()
    {
        // TODO: Add constructor logic here
    }

    public SqlConnection connect(String conString)
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json").Build();
        string cStr = configuration.GetConnectionString("myProjDB");
        SqlConnection con = new SqlConnection(cStr);
        con.Open();
        return con;
    }

    private SqlCommand CreateCommandWithStoredProcedureGENERAL(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        SqlCommand cmd = new SqlCommand
        {
            Connection = con,
            CommandText = spName,
            CommandTimeout = 10,
            CommandType = CommandType.StoredProcedure
        };
        if (paramDic != null)
            foreach (var param in paramDic)
                cmd.Parameters.AddWithValue(param.Key, param.Value);
        return cmd;
    }

    private SqlCommand CreateCommandWithStoredProcedureCreateNewEvent(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        return CreateCommandWithStoredProcedureGENERAL(spName, con, paramDic);
    }


    public bool CreateNewShuttle(Shuttle shuttle)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@EventID", shuttle.EventID },
            { "@PickUpLocation", shuttle.PickUpLocation },
            { "@Latitude", shuttle.Latitude },
            { "@Longitude", shuttle.Longitude },
            { "@Capacity", shuttle.Capacity },
            { "@DepartureTime", shuttle.DepartureTime },
            { "@ContactName", shuttle.ContactName },
            { "@ContactPhone", shuttle.ContactPhone }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_CreateNewShuttle", con, paramDic))
            {
                try
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            int shuttleID = Convert.ToInt32(reader["ShuttleID"]);
                            return shuttleID > 0;
                        }
                    }

                    return false;
                }
                catch (SqlException ex)
                {
                    // ✅ מוסיף הדפסת השגיאה ללוג או לקונסול
                    Console.WriteLine("❌ שגיאת SQL: " + ex.Message);
                    throw; // נשלח את השגיאה חזרה למעלה (ל־Controller)
                }
            }
        }
    }

    public List<Shuttle> GetALLShuttles(int EventID)
    {
        List<Shuttle> shuttles = new List<Shuttle>();

        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@EventID", EventID }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_MyShuttles", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Shuttle shuttle = new Shuttle
                        {
                            ShuttleID = Convert.ToInt32(reader["ShuttleID"]),
                            EventID = Convert.ToInt32(reader["EventID"]),
                            PickUpLocation = reader["PickupLocation"].ToString(),
                            DepartureTime = reader["DepartureTime"].ToString(),
                            Capacity = Convert.ToInt32(reader["Capacity"]),
                            ContactName = reader["ContactName"].ToString(),
                            ContactPhone = reader["ContactPhone"].ToString(), 
                            

                        };

                        shuttles.Add(shuttle);
                    }
                }
            }
        }

        return shuttles;
    }


    public bool DeleteShuttle(int ShuttleID)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@ShuttleID", ShuttleID } // ← תיקון השם
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_DeleteShuttle", con, paramDic))
            {
                try
                {
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
                catch (Exception ex)
                {
                    // ניתן גם ללוג או טיפול בשגיאה
                    return false;
                }
            }
        }
    }





    public void DeletePassengerByDriver(int driverID, int passengerID, int eventID)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@DriverID", driverID },
            { "@PassengerID", passengerID },
            { "@EventID", eventID }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_DeletePassengerByDriver", con, paramDic))
            {
                try
                {
                    cmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    // אפשר להוסיף לוג או להחזיר הודעת שגיאה
                    throw new Exception("שגיאה במחיקת נוסע מהסעה: " + ex.Message);
                }
            }
        }
    }




    public void CreateNewEvent(Event e)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
         {
             { "@PartnerID1", e.PartnerID1 },
             { "@PartnerID2", e.PartnerID2 },
             { "@EventDesc", e.EventDesc },
             {"@NumOfGuest" , e.NumOfGuest },
             {"@EventDate" , e.EventDate },
             {"@EventLocation" , e.EventLocation },
             {"@EventLatitude" , e.EventLatitude },
             {"@EventLongitude" , e.EventLongitude },
         };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureCreateNewEvent("SP_CreateNewEvent", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        e.EventID = Convert.ToInt32(reader["EventID"]);
                    }
                }
            }

        }
    }

    public int updateEvent(Event NewEvent)
    {
        SqlConnection con = null;
        try
        {
            con = connect("myProjDB");

            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            {"@eventID", NewEvent.EventID },
            {"@EventDesc", NewEvent.EventDesc },
            {"@NumOfGuest", NewEvent.NumOfGuest },
            {"@EventDate", NewEvent.EventDate },
            {"@EventLocation", NewEvent.EventLocation },
            {"@EventLatitude", NewEvent.EventLatitude },
            {"@EventLongitude", NewEvent.EventLongitude },
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureCreateNewEvent("SP_updateEvent", con, paramDic))
            {
                int rowsAffected = cmd.ExecuteNonQuery(); // מתאים לעדכון
                return rowsAffected; // מחזיר כמה שורות עודכנו
            }
        }
        catch (Exception ex)
        {
            // לוג שגיאה או הדפסה
            Console.WriteLine("❌ שגיאה בעדכון האירוע: " + ex.Message);
            return -1; // מציין כישלון
        }
        finally
        {
            if (con != null && con.State == System.Data.ConnectionState.Open)
            {
                con.Close();
            }
        }
    }

public void CreateNewPerson(Person person)



    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>

        {
            { "@FullName", person.FullName },
            { "@Password", person.Password },
            { "@PhoneNumber", person.PhoneNumber },
            { "@Gender", person.Gender },
            { "@Smoke", person.Smoke }
        };


            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_CreateNewPerson", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {

                    if (reader.Read())
                    {
                        person.PersonID = Convert.ToInt32(reader["PersonID"]);
                    }
                }
            }
        }
    }

    private SqlCommand CreateCommandWithStoredProcedureCreateNewPerson(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        return CreateCommandWithStoredProcedureGENERAL(spName, con, paramDic);
    }


    public int CreateGuests(Person person)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>

        {
            { "@FullName", person.FullName },
            { "@Password", person.Password },
            { "@PhoneNumber", person.PhoneNumber },
            { "@Gender", person.Gender },
            { "@Smoke", person.Smoke }
        };


            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_CreateGuest", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        person.PersonID = Convert.ToInt32(reader["PersonID"]);
                    }
                }

            }
        }
        return person.PersonID;
    }


    public void insertPassengers(List<Ride> Rides)
    {
        using (SqlConnection con = connect("myProjDB"))
        {

            foreach (var p in Rides)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("@DriverID", p.DriverID);
                parameters.Add("@passengerID", p.PassengerID);
                parameters.Add("@eventID", p.EventID);


                SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_InsertRide", con, parameters);
                try
                {
                    int rows = cmd.ExecuteNonQuery();
                    Console.WriteLine($"✅ שיבוץ: DriverID={p.DriverID}, PassengerID={p.PassengerID}, EventID={p.EventID}, נשמר? {rows > 0}");
                }
                catch (SqlException ex)
                {
                    Console.WriteLine($"⚠️ שגיאה בהכנסת שיבוץ: {ex.Message}");
                }
            }

        }

    }



    public List<Dictionary<string, object>> GetRidesByPerson(int PersonID)
    {
        List<Dictionary<string, object>> results = new List<Dictionary<string, object>>();

        using (SqlConnection con = connect("myProjDB"))
        {
            SqlCommand cmd = new SqlCommand("SP_GetRidesByPerson", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@PersonID", PersonID);

            SqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                Dictionary<string, object> row = new Dictionary<string, object>();

                for (int i = 0; i < reader.FieldCount; i++)
                {
                    string colName = reader.GetName(i);
                    object colValue = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    row[colName] = colValue;
                }

                results.Add(row);
            }
        }

        return results;
    }


    public int CreateGuestsInEvent(List<GuestInEvent> guestList)
    {
        int rowsAffected = 0;

        using (SqlConnection con = connect("myProjDB"))
        {

            foreach (GuestInEvent guest in guestList)
            {
                Dictionary<string, object> paramDic = new Dictionary<string, object>
                {
                    { "@PersonID", guest.PersonID },
                    { "@EventID", guest.EventID },
                    { "@RoleInEvent", guest.RoleInEvent },
                    { "@NumOfGuest", guest.NumOfGuest },
                    { "@RsvpStatus", guest.RsvpStatus },
                    { "@SideInWedding", guest.SideInWedding },
                    { "@RelationToCouple", guest.RelationToCouple }
                };

                using (SqlCommand cmd = CreateCommandWithStoredProcedure("SP_InsertGuestInEvent", con, paramDic))
                {
                    rowsAffected += cmd.ExecuteNonQuery();
                }
            }
        }

        return rowsAffected;
    }



    //---------------------------------------------------------------------------------
    // Create the SqlCommand using a stored procedure  -- Coordinate
    //---------------------------------------------------------------------------------


    private SqlCommand CreateCommandWithStoredProcedureGetCoordinates(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        return CreateCommandWithStoredProcedureGENERAL(spName, con, paramDic);
    }

    public GeoPoint GetCoordinatesForCity(string cityName)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@City", cityName }
            };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGetCoordinates("SP_returnCoordinates", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        double lon = Convert.ToDouble(reader["Longitude"]);
                        double lat = Convert.ToDouble(reader["Latitude"]);
                        return new GeoPoint(lat, lon);
                    }
                    else
                    {
                        throw new Exception($"Coordinates not found for city: {cityName}");
                    }
                }
            }
        }
    }

    private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        return CreateCommandWithStoredProcedureGENERAL(spName, con, paramDic);
    }

public int logInUser(string phone, string password)
{
    // בדיקת אדמין לפני פנייה ל־DB
    if (phone == "Admin" && password == "Admin")
        return 1;

    using (SqlConnection con = connect("myProjDB"))
    {
        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@phoneNumber", phone },
            { "@password", password }
        };

        using (SqlCommand cmd = CreateCommandWithStoredProcedure("SP_logInUser", con, paramDic))
        {
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    return Convert.ToInt32(reader["PersonID"]);
                }
                else
                {
                    return -1;
                }
            }
        }
    }
}

    private SqlCommand CreateCommandWithStoredProcedureGetALLRequests(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        return CreateCommandWithStoredProcedureGENERAL(spName, con, paramDic);
    }

    public RideMatcher GetALLRequests(int EventID)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@EventID", EventID }
            };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGetALLRequests("SP_GetALLRequests", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    List<GiveRideRequest> giveRideRequests = new List<GiveRideRequest>();
                    List<RideRequest> rideRequests = new List<RideRequest>();
                    string eventLocation = "";
                    double eventLatitude = 0;
                    double eventLongitude = 0;

                    while (reader.Read())
                    {
                        var rideExitPoint = reader["RideExitPoint"].ToString();
                        giveRideRequests.Add(new GiveRideRequest(
                            Convert.ToInt32(reader["ID"]),
                            EventID,
                            Convert.ToInt32(reader["PersonID"]),
                            Convert.ToInt32(reader["CarCapacity"]),
                            rideExitPoint,
                            reader["PreferredGender"].ToString(),
                            Convert.ToBoolean(reader["PreferredSmoker"]),
                               Convert.ToDouble(reader["Latitude"]),
                            Convert.ToDouble(reader["Longitude"])
                         
                        )
                            );


                    }

                    if (reader.NextResult())
                    {
                        while (reader.Read())
                        {
                            var pickUpLocation = reader["PickUpLocation"].ToString();
                            rideRequests.Add(new RideRequest(
                                Convert.ToInt32(reader["ID"]),
                                EventID,
                                Convert.ToInt32(reader["PersonID"]),
                                Convert.ToInt32(reader["NumOfGuest"]),
                                pickUpLocation,
                                reader["PreferredGender"].ToString(),
                                Convert.ToBoolean(reader["PreferredSmoker"]),
                                Convert.ToDouble(reader["latitude"]),
                                Convert.ToDouble(reader["Longitude"])
                            )
                         );
                        }
                    }

                    if (reader.NextResult() && reader.Read())
                    {
                        eventLocation = reader["EventLocation"].ToString();
                        eventLatitude = Convert.ToDouble(reader["EventLatitude"]);
                        eventLongitude = Convert.ToDouble(reader["EventLongitude"]);
                    }


                    return new RideMatcher(giveRideRequests, rideRequests, eventLocation, eventLongitude, eventLatitude);
                }
            }
        }
    }

    public int GetRideRequestsCount(int eventId)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@EventID", eventId }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetRideRequest", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        int total = Convert.ToInt32(reader["totalRideRequest"]);
                        
                        return total; 
                    }
                    else
                    {
                        return 0; 
                    }
                }
            }
        }
    }
    public int GetGiveRideRequestsCount(int eventId)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@EventID", eventId }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetGiveRideRequest", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        int total = Convert.ToInt32(reader["totalGiveRideRequest"]);

                        return total;
                    }
                    else
                    {
                        return 0;
                    }
                }
            }
        }
    }
    public List<(string Status, int Count)> GetRSVPStatusCounts(int eventId)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@EventID", eventId }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetRSVPStatusData", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    List<(string, int)> results = new List<(string, int)>();
                    while (reader.Read())
                    {
                        string status = reader["RSVPStatus"]?.ToString() ?? "לא ידוע";
                        int count = Convert.ToInt32(reader["Count"]);
                        results.Add((status, count));
                    }
                    return results;
                }
            }
        }
    }



    public List<string> GetCities()
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetCities", con, null))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    List<string> cities = new List<string>();
                    while (reader.Read())
                    {
                        cities.Add(reader["CityName"].ToString());
                    }
                    return cities;
                }
            }
        }
    }

    public void CreateNewRequest(RideRequest request, string gender, bool smoke)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@personID", request.PersonID },
            { "@eventID", request.EventID },
            { "@numOfGuest", request.NumOfGuest },
            { "@pickUpLocation", request.PickUpLocation },
            { "@preferredGender", request.PreferredGender },
            { "@preferredSmoker", request.PreferredSmoker },
            { "@latitude", request.Latitude },
            { "@longitude", request.Longitude },
            { "@note", (object?)request.Note ?? DBNull.Value },
            { "@actualGender", gender },
            { "@isSmoker", smoke }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_insertRideRequest", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                  
                }
            }
        }
    }


    public void CreateNewGiveRideRequest(GiveRideRequest giveRide, string gender, bool smoke)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@personID", giveRide.PersonID },
                { "@eventID", giveRide.EventID },
                { "@carCapacity", giveRide.CarCapacity },
                { "@RideExitPoint", giveRide.RideExitPoint },
                { "@preferredGender", giveRide.PreferredGender },
                { "@preferredSmoker", giveRide.PreferredSmoker },
                { "@latitude", giveRide.Latitude },
                { "@longitude", giveRide.Longitude },
                { "@note", (object?)giveRide.Note ?? DBNull.Value },
            { "@actualGender", gender },
            { "@isSmoker", smoke }

            };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_insertGiveRideRequest", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    // אין פלט
                }
            }
        }
    }


    public List<dynamic> GetEvents(int PersonID)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@PersonID", PersonID }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetEvents", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    List<dynamic> results = new List<dynamic>();
                    while (reader.Read())
                    {
                        var evt = new Event
                        {
                            EventID = Convert.ToInt32(reader["EventID"]),
                            EventDesc = reader["EventDesc"].ToString(),
                            EventDate = Convert.ToDateTime(reader["EventDate"]),
                            EventLocation = reader["EventLocation"].ToString(),
                            EventLatitude = Convert.ToDouble(reader["EventLatitude"]),
                            EventLongitude = Convert.ToDouble(reader["EventLongitude"])
                        };

                        results.Add(new
                        {
                            Event = evt,
                            RsvpStatus = reader["RsvpStatus"].ToString()
                        });
                    }
                    return results;
                }
            }
        }
    }


    public Person GetPerson(int personID)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@PersonID", personID }
            };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureRead("SP_GetPersonInfo", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new Person
                        {
                            PersonID = Convert.ToInt32(reader["PersonID"]),
                            FullName = reader["FullName"].ToString(),
                            Password = reader["Password"].ToString(),
                            PhoneNumber = reader["PhoneNumber"].ToString(),
                            Smoke = Convert.ToBoolean(reader["Smoke"]),
                            Gender = reader["Gender"].ToString(),
                         
                        };
                    }
                    else
                    {
                        throw new Exception("Person not found.");
                    }
                }
            }
        }
    }

    private SqlCommand CreateCommandWithStoredProcedureRead(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        return CreateCommandWithStoredProcedureGENERAL(spName, con, paramDic);
    }

    public EventSetting GetEventSettings(int EventID)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@EventID", EventID }
            };

        using (SqlCommand cmd = CreateCommandWithStoredProcedureRead("SP_GetEventSettings", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new EventSetting
                        {
                            EventID = Convert.ToInt32(reader["EventID"]),
                            DistanceFirstFilter = Convert.ToDouble(reader["DistanceFirstFilter"]),
                            DetourTime = Convert.ToDouble(reader["DetourTime"]),
                            DistanceWeight = Convert.ToDouble(reader["DistanceWeight"]),
                            SmokingPreferenceWeight = Convert.ToDouble(reader["SmokingPreferenceWeight"]),
                            GenderPreferenceWeight = Convert.ToDouble(reader["GenderPreferenceWeight"]),
                            FamilyRelationWeight = Convert.ToDouble(reader["FamilyRelationWeight"]),
                            LonleyWeight = Convert.ToDouble(reader["LonleyWeight"])
                        };
                    }
                    else
                    {
                        throw new Exception("");
                    }
                }
            }

        }

    }

    public int UpdateEventSettings(EventSetting eventSetting)
    {
        SqlConnection con = null;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");

            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@EventID", eventSetting.EventID },
            { "@DistanceFirstFilter", eventSetting.DistanceFirstFilter },
            { "@DetourTime", eventSetting.DetourTime },
            { "@DistanceWeight", eventSetting.DistanceWeight },
            { "@SmokingPreferenceWeight", eventSetting.SmokingPreferenceWeight },
            { "@GenderPreferenceWeight", eventSetting.GenderPreferenceWeight },
            { "@FamilyRelationWeight", eventSetting.FamilyRelationWeight },
            { "@LonleyWeight", eventSetting.LonleyWeight }
        };

            cmd = CreateCommandWithStoredProcedureGENERAL("SP_UpdateEventSettings", con, paramDic);

            SqlParameter returnValue = new SqlParameter();
            returnValue.Direction = ParameterDirection.ReturnValue;
            cmd.Parameters.Add(returnValue);

            cmd.ExecuteNonQuery();

            return (int)returnValue.Value;
        }
        catch (Exception ex)
        {
            throw new Exception("Error updating EventSettings: " + ex.Message);
        }
        finally
        {
            if (con != null)
                con.Close();
        }
    }

    public void UpdateInviteImageName(int eventID, string imageName)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@eventId", eventID }, // שם פרמטר תואם לפרוצדורה
                { "@InviteImageUrl", imageName } // שם פרמטר תואם לפרוצדורה
            };
            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_UpdateInviteImageUrl", con, paramDic))
            {
                cmd.ExecuteNonQuery();
            }
        }
    }

    public Event GetEventDetails(int eventID)
    {
        Event eventDetails = new Event();
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@EventID", eventID }
        };
            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetEventDetails", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {

                        eventDetails.PartnerID1 = Convert.ToInt32(reader["PartnerID1"]);
                        eventDetails.EventID = Convert.ToInt32(reader["EventID"]);
                        eventDetails.PartnerID2 = Convert.ToInt32(reader["PartnerID2"]);
                        eventDetails.EventDesc = Convert.ToString(reader["EventDesc"]);
                        eventDetails.NumOfGuest = Convert.ToInt32(reader["NumOfGuest"]);
                        eventDetails.EventDate = Convert.ToDateTime(reader["EventDate"]);
                        eventDetails.EventLocation = Convert.ToString(reader["EventLocation"]);

                        eventDetails.EventLatitude = Convert.ToDouble(reader["EventLatitude"]);
                        eventDetails.EventLongitude = Convert.ToDouble(reader["EventLongitude"]);

                    }
                    ;
                }
            }
        }

        return eventDetails;
    }

    public List<GuestInEvent> GetInviteDetails(int eventId)
    {
        List<GuestInEvent> guests = new List<GuestInEvent>();
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@EventID", eventId }
            };
            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetGuestsForEvent", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        GuestInEvent guest = new GuestInEvent
                        {
                            PersonID = Convert.ToInt32(reader["PersonID"]),
                            EventID = Convert.ToInt32(reader["EventID"]),
                            RoleInEvent = Convert.ToString(reader["RoleInEvent"]),
                            NumOfGuest = Convert.ToInt32(reader["NumOfGuest"]),
                            RsvpStatus = Convert.ToString(reader["RsvpStatus"]),
                            SideInWedding = Convert.ToString(reader["SideInWedding"]),
                            RelationToCouple = Convert.ToString(reader["RelationToCouple"]),                     
                            FullName = Convert.ToString(reader["FullName"]),
                            PhoneNumber = Convert.ToString(reader["PhoneNumber"]),
                        }; 
                        guests.Add(guest);
                    }
                }
            }
        }
        return guests;
    }

    public int UpdateGuestRSVPStatus(int eventId, int personId, string rsvpStatus)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@eventID", eventId },
                { "@personID", personId },
                { "@RSVPstatus", rsvpStatus }
            };
            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("UpdateGuestRSVPStatus", con, paramDic))
            {
                return cmd.ExecuteNonQuery();
            }
        }
    }
    public bool ApproveRide(int rideID, int personID)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            var paramDic = new Dictionary<string, object>
        {
            { "RideID", rideID },
            { "PersonID", personID }
        };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_ApproveRide", con, paramDic))
            {
                cmd.ExecuteNonQuery();
                return true; // ✅ מחזיר הצלחה תמיד – גם אם rows == 0
            }
        }
    }



}
