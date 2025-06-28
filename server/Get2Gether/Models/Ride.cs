using System;
namespace Get2Gether.Models
{
    public class Ride
	{
        int rideID;
        int eventID;
        int driverID;
        int passengerID;

        public Ride()
		{
		}

        public Ride(int rideID, int eventID, int driverID, int passengerID)
        {
            RideID = rideID;
            EventID = eventID;
            DriverID = driverID;
            PassengerID = passengerID;
        }

        public int RideID { get => rideID; set => rideID = value; }
        public int EventID { get => eventID; set => eventID = value; }
        public int DriverID { get => driverID; set => driverID = value; }
        public int PassengerID { get => passengerID; set => passengerID = value; }




        public void insertPassengers(List<Ride> NewRides)
        {
            DBservices dbs = new DBservices();
            dbs.insertPassengers(NewRides);
        }


        public static List<Dictionary<string, object>> GetPassengerDetails(int eventID, int driverID)
        {
            DBservices dbs = new DBservices();
            return dbs.GetPassengerDetails(eventID, driverID);
        }

    }

}

