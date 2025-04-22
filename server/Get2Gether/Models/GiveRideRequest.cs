namespace Get2Gether.Models
{
    public class GiveRideRequest
    {
        public int Id { get; set; }
        public int EventID { get; set; }
        public int PersonID { get; set; }
        public int CarCapacity { get; set; }
        public string RideExitPoint { get; set; }
        public string PreferredGender { get; set; }
        public bool PreferredSmoker { get; set; }
        public GeoPoint RideExitCoordinates { get; set; }

        public GiveRideRequest() { }

        public GiveRideRequest(int id, int eventID, int personID, int carCapacity, string rideExitPoint, string preferredGender, bool preferredSmoker)
        {
            Id = id;
            EventID = eventID;
            PersonID = personID;
            CarCapacity = carCapacity;
            RideExitPoint = rideExitPoint;
            PreferredGender = preferredGender;
            PreferredSmoker = preferredSmoker;
        }

        public static void CreateNewGiveRideRequest(GiveRideRequest giveRide)
        {
            DBservices db = new DBservices();
            db.CreateNewGiveRideRequest(giveRide);
        }
    }
}
