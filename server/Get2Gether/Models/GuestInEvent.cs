using System;
namespace Get2Gether.Models
{
    public class GuestInEvent
	{
        public int PersonInEventID { get; set; }
        public int PersonID { get; set; }
        public int EventID { get; set; }
        public string? RoleInEvent { get; set; }
        public int NumOfGuest { get; set; }
        public string? RsvpStatus { get; set; }
        public string? SideInWedding { get; set; }
        public string? RelationToCouple { get; set; }       
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public GuestInEvent()
		{
		}

        public GuestInEvent(int personInEventID, int personID, int eventID, string roleInEvent, int numOfGuest, string rsvpStatus, string sideInWedding, string relationToCouple)
        {
            PersonInEventID = personInEventID;
            PersonID = personID;
            EventID = eventID;
            RoleInEvent = roleInEvent;
            NumOfGuest = numOfGuest;
            RsvpStatus = rsvpStatus;
            SideInWedding = sideInWedding;
            RelationToCouple = relationToCouple;
        }
        public static int GetRequestsCount(int eventID)
        {
            DBservices db = new DBservices();
            return db.GetRideRequestsCount(eventID);
        }

        public static int GetGiveRideRequestsCount(int eventID)
        {
            DBservices db = new DBservices();
            return db.GetGiveRideRequestsCount(eventID);
        }
        public static List<(string Status, int Count)> GetRSVPStatusCounts(int eventID)
        {
            DBservices db = new DBservices();
            return db.GetRSVPStatusCounts(eventID); 
        }
        public static List<GuestInEvent> GetInviteDetails(int eventId)
        {
            DBservices db = new DBservices();
            return db.GetInviteDetails(eventId);
        }

    }
}

