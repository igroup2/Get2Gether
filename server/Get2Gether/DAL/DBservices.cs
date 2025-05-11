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

/// <summary>
/// DBServices is a class created by me to provides some DataBase Services
/// </summary>
public class DBservices
{

    public DBservices()
    {
        //
        // TODO: Add constructor logic here
        //
    }

    //--------------------------------------------------------------------------------------------------
    // This method creates a connection to the database according to the connectionString name in the web.config 
    //--------------------------------------------------------------------------------------------------
    public SqlConnection connect(String conString)
    {

        // read the connection string from the configuration file
        IConfigurationRoot configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json").Build();
        string cStr = configuration.GetConnectionString("myProjDB");
        SqlConnection con = new SqlConnection(cStr);
        con.Open();
        return con;
    }

    private SqlCommand CreateCommandWithStoredProcedureGENERAL(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }

    //---------------------------------------------------------------------------------
    // Create the SqlCommand using a stored procedure 
    //---------------------------------------------------------------------------------

    private SqlCommand CreateCommandWithStoredProcedureCreateNewEvent(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }
    //--------------------------------------------------------------------------------------------------
    // This method insert a User to the User table 
    //--------------------------------------------------------------------------------------------------
    //
    public void CreateNewEvent(Event NewEvent)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@PartnerID1", NewEvent.PartnerID1);
        paramDic.Add("@PartnerID2", NewEvent.PartnerID2);
        paramDic.Add("@EventDesc", NewEvent.EventDesc);
        paramDic.Add("@NumOfGuest", NewEvent.NumOfGuest);
        paramDic.Add("@EventDate", NewEvent.EventDate);
        paramDic.Add("@EventLocation", NewEvent.EventLocation);
        paramDic.Add("@EventLatitude", NewEvent.EventLatitude); 
        paramDic.Add("@EventLongitude", NewEvent.EventLongitude);

        using (cmd = CreateCommandWithStoredProcedureCreateNewEvent("SP_CreateNewEvent", con, paramDic)) 
        {
            using (SqlDataReader reader = cmd.ExecuteReader())
            if(reader.Read()) 
                {

   
                NewEvent.EventID = Convert.ToInt32(reader["EventID"]);
            }
        }

    }




    //---------------------------------------------------------------------------------
    // Create the SqlCommand using a stored procedure 
    //---------------------------------------------------------------------------------


    private SqlCommand CreateCommandWithStoredProcedureCreateNewPerson(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
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

            using (SqlCommand cmd = CreateCommandWithStoredProcedureCreateNewPerson("SP_CreateNewPerson", con, paramDic))
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


    //---------------------------------------------------------------------------------
    // Create the SqlCommand using a stored procedure  -- Coordinate
    //---------------------------------------------------------------------------------


    private SqlCommand CreateCommandWithStoredProcedureGetCoordinates(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }
    //--------------------------------------------------------------------------------------------------
    // This method find coordinate
    //--------------------------------------------------------------------------------------------------
    //
    public GeoPoint GetCoordinatesForCity(string cityName)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@City", cityName);


        cmd = CreateCommandWithStoredProcedureGetCoordinates("SP_returnCoordinates", con, paramDic);          // create the command
        SqlParameter returnValue = new SqlParameter
        {
            Direction = ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(returnValue);

        SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
        if (string.IsNullOrWhiteSpace(cityName))
        {
            throw new Exception("City name is empty or null!");
        }
        if (reader.Read())
        {
            double lon = Convert.ToDouble(reader["Longitude"]);
            double lat = Convert.ToDouble(reader["Latitude"]);
            

           

            return new GeoPoint(lat, lon);
        }
        else
        {
            if (con != null) con.Close();
            throw new Exception($"Coordinates not found for city: {cityName}");
        }
    }



    //---------------------------------------------------------------------------------
    // Create the SqlCommand using a stored procedure  -- filter dunc
    //---------------------------------------------------------------------------------


    private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }
    //--------------------------------------------------------------------------------------------------
    // log in for users 
    //--------------------------------------------------------------------------------------------------
    //
    public int logInUser(string password, string phoneNum)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@password", password);
        paramDic.Add("@phoneNumber", phoneNum);


        cmd = CreateCommandWithStoredProcedure("SP_logInUser", con, paramDic);          // create the command
        SqlParameter returnValue = new SqlParameter

        {
            Direction = ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(returnValue);

        try
        {
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            if (reader.Read())
            {
                reader.Close();
                return 1;

            }
            else
            {
                reader.Close();
                return 0;
            }
        }
        catch (Exception ex)
        {
            // write to log
            throw;
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    private SqlCommand CreateCommandWithStoredProcedureGetALLRequests(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }
    //--------------------------------------------------------------------------------------------------
    // This method find coordinate
    //--------------------------------------------------------------------------------------------------
    //
    public RideMatcher GetALLRequests(int EventID)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw ex;
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@EventID", EventID);

        cmd = CreateCommandWithStoredProcedureGetALLRequests("SP_GetALLRequests", con, paramDic);
        SqlParameter returnValue = new SqlParameter
        {
            Direction = ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(returnValue);

        SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        List<GiveRideRequest> giveRideRequests = new List<GiveRideRequest>();
        List<RideRequest> rideRequests = new List<RideRequest>();
        string eventLocation = "";

        // --- קריאה ל-GiveRideRequest ---
        while (reader.Read())
        {
            int id = Convert.ToInt32(reader["ID"]);
            int personID = Convert.ToInt32(reader["PersonID"]);
            int carCapacity = Convert.ToInt32(reader["CarCapacity"]);
            string rideExitPoint = Convert.ToString(reader["RideExitPoint"]);
            string preferredGender = Convert.ToString(reader["PreferredGender"]);
            bool preferredSmoker = Convert.ToBoolean(reader["PreferredSmoker"]);

            // הנה החלק החדש - קבלת קואורדינטות
            GeoPoint coordinates = GetCoordinatesForCity(rideExitPoint);
           
            GiveRideRequest grr = new GiveRideRequest(id, EventID, personID, carCapacity, rideExitPoint, preferredGender, preferredSmoker);
            grr.RideExitCoordinates = coordinates; // שמור את הקואורדינטות
            giveRideRequests.Add(grr);
        }

        // --- קריאה ל-RideRequest ---
        if (reader.NextResult())
        {
            while (reader.Read())
            {
                int id = Convert.ToInt32(reader["ID"]);
                int personID = Convert.ToInt32(reader["PersonID"]);
                int numOfGuest = Convert.ToInt32(reader["NumOfGuest"]);
                string pickUpLocation = Convert.ToString(reader["PickUpLocation"]);
                string preferredGender = Convert.ToString(reader["PreferredGender"]);
                bool preferredSmoker = Convert.ToBoolean(reader["PreferredSmoker"]);

                GeoPoint coordinates = GetCoordinatesForCity(pickUpLocation);
               
                RideRequest rr = new RideRequest(id, EventID, personID, numOfGuest, pickUpLocation, preferredGender, preferredSmoker);
                rr.PickUpCoordinates = coordinates; // שמור את הקואורדינטות
                rideRequests.Add(rr);
            }
        }

        // --- קריאה למיקום האירוע ---
        if (reader.NextResult())
        {
            if (reader.Read())
            {
                eventLocation = Convert.ToString(reader["EventLocation"]);
                
            }
        }
        GeoPoint Eventcoordinates = GetCoordinatesForCity(eventLocation);
        reader.Close();

        RideMatcher rd =  new RideMatcher(giveRideRequests, rideRequests, eventLocation, Eventcoordinates);
        return rd;
    }


    public List<string> GetCities()
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw ex;
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();


        cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetCities", con, paramDic);
        SqlParameter returnValue = new SqlParameter
        {
            Direction = ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(returnValue);

        SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        List<string> cities = new List<string>();



        while (reader.Read())
        {
            string city = Convert.ToString(reader["CityName"]);

            cities.Add(city);
        }
        return cities;

    }

    public void CreateNewRequest(RideRequest request)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@personID", request.PersonID);
        paramDic.Add("@eventID", request.EventID);
        paramDic.Add("@numOfGuest", request.NumOfGuest);
        paramDic.Add("@pickUpLocation", request.PickUpLocation);
        paramDic.Add("@preferredGender", request.PreferredGender);
        paramDic.Add("@preferredSmoker", request.PreferredSmoker);


        cmd = CreateCommandWithStoredProcedureGENERAL("SP_insertRideRequest", con, paramDic);
        // create the command
        SqlParameter returnValue = new SqlParameter
        {
            Direction = ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(returnValue);
        SqlDataReader TheUser = cmd.ExecuteReader(CommandBehavior.CloseConnection);


        if (con != null)
        {
            // close the db connection
            con.Close();
        }



    }
    public List<Event> GetEvents(int PersonID)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw ex;
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@PersonID", PersonID);


        cmd = CreateCommandWithStoredProcedureGENERAL("SP_GetEvents", con, paramDic);

        SqlParameter returnValue = new SqlParameter
        {
            Direction = ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(returnValue);

        SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        List<Event> events = new List<Event>();

        while (reader.Read())
        {
            Event ev = new Event();

            ev.EventID = Convert.ToInt32(reader["EventID"]);
            ev.EventDesc = Convert.ToString(reader["EventDesc"]);
            ev.EventDate = Convert.ToDateTime(reader["EventDate"]);
            ev.EventLocation = Convert.ToString(reader["EventLocation"]);
            ev.EventLatitude = Convert.ToDouble(reader["EventLatitude"]);
            ev.EventLongitude = Convert.ToDouble(reader["EventLongitude"]);

            events.Add(ev);
        }

        return events;
    }
    public void CreateNewGiveRideRequest(GiveRideRequest giveRide)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@personID", giveRide.PersonID);
        paramDic.Add("@eventID", giveRide.EventID);
        paramDic.Add("@CarCapacity", giveRide.CarCapacity);
        paramDic.Add("@RideExitPoint", giveRide.RideExitPoint);
        paramDic.Add("@preferredGender", giveRide.PreferredGender);
        paramDic.Add("@preferredSmoker", giveRide.PreferredSmoker);


        cmd = CreateCommandWithStoredProcedureGENERAL("SP_insertGiveRideRequest", con, paramDic);
        // create the command
        SqlParameter returnValue = new SqlParameter
        {
            Direction = ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(returnValue);
        SqlDataReader TheUser = cmd.ExecuteReader(CommandBehavior.CloseConnection);


        if (con != null)
        {
            // close the db connection
            con.Close();
        }



    }

    //--------------------------------------------------------------------------------------------------
    // This method return a person 
    //--------------------------------------------------------------------------------------------------
    //
    public Person GetPerson(int personID)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Person ThePerson = new Person();

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@PersonID", personID);

        cmd = CreateCommandWithStoredProcedureRead("SP_GetPersonInfo", con, paramDic);

        SqlDataReader PersonSql = cmd.ExecuteReader(CommandBehavior.CloseConnection);


        ThePerson.PersonID = Convert.ToInt32(PersonSql["PersonID"]);
        ThePerson.FullName = PersonSql["FullName"].ToString();
        ThePerson.Password = PersonSql["Password"].ToString();
        ThePerson.PhoneNumber = PersonSql["PhoneNumber"].ToString();
        ThePerson.Smoke = Convert.ToBoolean(PersonSql["Smoke"]);
        ThePerson.Gender = PersonSql["Gender"].ToString();
        //ThePerson.SideInWedding = PersonSql["SideInWedding"].ToString();
        //ThePerson.RelationToCouple = PersonSql["RelationToCouple"].ToString();


        // create the command
        return ThePerson;


    }
    //

    //---------------------------------------------------------------------------------
    // Create the SqlCommand
    //---------------------------------------------------------------------------------
    private SqlCommand CreateCommandWithStoredProcedureRead(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }


}
