using System;
using Microsoft.Extensions.Logging;

namespace Get2Gether.Models
{
    public class Ride
	{
        int rideID;
        int eventID;
        int driverID;
        int passengerID;
        string rideStatus;
        bool isActive;

        public Ride()
		{
		}

        public Ride(int rideID, int eventID, int driverID, int passengerID, string rideStatus, bool isActive)
        {
            RideID = rideID;
            EventID = eventID;
            DriverID = driverID;
            PassengerID = passengerID;
            RideStatus = rideStatus;
            IsActive = isActive;
        }

        public int RideID { get => rideID; set => rideID = value; }
        public int EventID { get => eventID; set => eventID = value; }
        public int DriverID { get => driverID; set => driverID = value; }
        public int PassengerID { get => passengerID; set => passengerID = value; }
        public string RideStatus { get => rideStatus; set => rideStatus = value; }
        public bool IsActive { get => isActive; set => isActive = value; }




        public void insertPassengers(List<Ride> NewRides)
        {
            DBservices dbs = new DBservices();
            dbs.insertPassengers(NewRides);
        }


        public static List<Dictionary<string, object>> GetRidesByPerson(int PersonID)
        {
            DBservices dbs = new DBservices();
            return dbs.GetRidesByPerson(PersonID);
        }

        public void deletePassengerByDriver(int driverID, int passengerID, int eventID)
        {
            DBservices dbs = new DBservices();
            dbs.DeletePassengerByDriver(driverID,passengerID,eventID);
        }

        public bool ApproveRide(int rideID, string role)
        {
            DBservices dbs = new DBservices();
            return dbs.ApproveRide(rideID, role);
        }
    }

}

