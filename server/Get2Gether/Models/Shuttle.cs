using System;
namespace Get2Gether.Models
{
	public class Shuttle
	{
        public int ShuttleID { get; set; }
        public int EventID { get; set; }
        public string PickUpLocation { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int Capacity { get; set; }
        public string DepartureTime { get; set; }
        public string ContactName { get; set; }
        public string ContactPhone { get; set; }

        public Shuttle()
		{
		}

        public Shuttle(int shuttleID, int eventID, string pickUpLocation, double latitude, double longitude, int capacity, string departureTime, string contactName, string contactPhone)
        {
            ShuttleID = shuttleID;
            EventID = eventID;
            PickUpLocation = pickUpLocation;
            Latitude = latitude;
            Longitude = longitude;
            Capacity = capacity;
            DepartureTime = departureTime;
            ContactName = contactName;
            ContactPhone = contactPhone;
        }

        public bool CreateNewShuttle(Shuttle shuttle)
        {
            DBservices dbs = new DBservices();
            return dbs.CreateNewShuttle(shuttle);
        }

        public bool DeleteShuttle(int ShuttleID)
        {
            DBservices dbs = new DBservices();
            return dbs.DeleteShuttle(ShuttleID);
        }

        public List<Shuttle> GetALLShuttles(int EventID)
        {
            DBservices dbs = new DBservices();
            return dbs.GetALLShuttles(EventID);
        }


    }
}

