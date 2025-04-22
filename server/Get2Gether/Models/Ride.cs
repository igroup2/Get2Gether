using System;
namespace Get2Gether.Models
{
    public class Ride
	{
        int rideID;
        int eventID;
        int driverID;
        DateTime rideDate;
        string status;

        public Ride()
		{
		}

        public Ride(int rideID, int eventID, int driverID, DateTime rideDate, string status)
        {
            RideID = rideID;
            EventID = eventID;
            DriverID = driverID;
            RideDate = rideDate;
            Status = status;
        }

        public int RideID { get => rideID; set => rideID = value; }
        public int EventID { get => eventID; set => eventID = value; }
        public int DriverID { get => driverID; set => driverID = value; }
        public DateTime RideDate { get => rideDate; set => rideDate = value; }
        public string Status { get => status; set => status = value; }
    }
}

