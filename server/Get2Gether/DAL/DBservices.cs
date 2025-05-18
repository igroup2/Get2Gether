using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Get2Gether.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc.Diagnostics;

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










//--------------------------------------------------------------------------------------------------
// This method insert a Person to the Person table 
//--------------------------------------------------------------------------------------------------
//
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


            using (SqlCommand cmd = CreateCommandWithStoredProcedureCreateNewPerson("SP_CreateGuest", con, paramDic))
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

    private SqlCommand CreateCommandWithStoredProcedureCreateNewPerson(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        return CreateCommandWithStoredProcedureGENERAL(spName, con, paramDic);
    }

    /// <summary>
    /// create guest in event 
    /// </summary>
    /// <returns></returns>
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
        using (SqlConnection con = connect("myProjDB"))
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@password", phone },
                { "@phoneNumber", password }
            };

            using (SqlCommand cmd = CreateCommandWithStoredProcedure("SP_logInUser", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    int isAdmin = 0;  
                    if (reader.Read())
                    {
                        isAdmin = Convert.ToInt32(reader["isAdmin"]);
                        
                    }
                    return isAdmin; 
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
                        GeoPoint coordinates = GetCoordinatesForCity(rideExitPoint);
                        giveRideRequests.Add(new GiveRideRequest(
                            Convert.ToInt32(reader["ID"]),
                            EventID,
                            Convert.ToInt32(reader["PersonID"]),
                            Convert.ToInt32(reader["CarCapacity"]),
                            rideExitPoint,
                            reader["PreferredGender"].ToString(),
                            Convert.ToBoolean(reader["PreferredSmoker"]),
                            Convert.ToDouble("Longitude"),
                            Convert.ToDouble("latitude")
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
                                Convert.ToDouble("Longitude"),
                                Convert.ToDouble("latitude")
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


    public void CreateNewRequest(RideRequest request)
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
                { "@note", (object?)request.Note ?? DBNull.Value }

            };

            using (SqlCommand cmd = CreateCommandWithStoredProcedureGENERAL("SP_insertRideRequest", con, paramDic))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    // אין פלט
                }
            }
        }
    }

    public void CreateNewGiveRideRequest(GiveRideRequest giveRide)
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
                { "@note", (object?)giveRide.Note ?? DBNull.Value }

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


    public List<Event> GetEvents(int PersonID)
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
                    List<Event> events = new List<Event>();
                    while (reader.Read())
                    {
                        events.Add(new Event
                        {
                            EventID = Convert.ToInt32(reader["EventID"]),
                            EventDesc = reader["EventDesc"].ToString(),
                            EventDate = Convert.ToDateTime(reader["EventDate"]),
                            EventLocation = reader["EventLocation"].ToString(),
                            EventLatitude = Convert.ToDouble(reader["EventLatitude"]),
                            EventLongitude = Convert.ToDouble(reader["EventLongitude"])
                        });
                    }
                    return events;
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


    //--------------------------------------------------------------------------------------------------
    // This method return a person 
    //--------------------------------------------------------------------------------------------------
    //
   
    //

    //---------------------------------------------------------------------------------
    // Create the SqlCommand
   



}
