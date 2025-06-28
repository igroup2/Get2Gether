using System;
namespace Get2Gether.Models
{
	public class PassengerInRide
	{
        int id;
        int rideID;
        int passengerID;
        int eventID;

        public PassengerInRide()
		{
		}

        public PassengerInRide(int id, int rideID, int passengerID,int eventID)
        {
            Id = id;
            RideID = rideID;
            PassengerID = passengerID;
            EventID = eventID;
        }

        public int Id { get => id; set => id = value; }
        public int RideID { get => rideID; set => rideID = value; }
        public int PassengerID { get => passengerID; set => passengerID = value; }
        public int EventID { get => eventID; set => eventID = value; }

    }

}

