namespace Get2Gether.Models
{
    public class RideRequest
    {
        public int Id { get; set; }
        public int EventID { get; set; }
        public int PersonID { get; set; }
        public int NumOfGuest { get; set; }
        public string PickUpLocation { get; set; }
        public string PreferredGender { get; set; }
        public bool PreferredSmoker { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string Note { get; set; }
        public RideRequest() { }

        public RideRequest(int id, int eventID, int personID, int numOfGuest, string pickUpLocation, string preferredGender, bool preferredSmoker, double latitude, double longitude, string note = null)
        {
            Id = id;
            EventID = eventID;
            PersonID = personID;
            NumOfGuest = numOfGuest;
            PickUpLocation = pickUpLocation;
            PreferredGender = preferredGender;
            PreferredSmoker = preferredSmoker;
            Latitude = latitude;
            Longitude = longitude;
            Note = note;
        }

        public void CreateNewRequest(RideRequest request,string gender, bool smoke)
        {
            DBservices db = new DBservices();
            db.CreateNewRequest(request, gender,smoke);
        }
    }
}