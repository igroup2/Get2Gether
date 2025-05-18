using System;
using System.Collections.Generic;
namespace Get2Gether.Models
{
    public class Event
	{
		int eventID;
		int partnerID1;
        int partnerID2;
        string eventDesc;
		int numOfGuest;
		DateTime eventDate;
		string eventLocation; //שם האולם
        double eventLatitude;
        double eventLongitude;


        public Event()
		{
		}

        public Event(int eventID, int partnerID1, int partnerID2, string eventDesc, int numOfGuest, DateTime eventDate, string eventLocation, double eventLatitude, double eventLongitude)
        {
            EventID = eventID;
            PartnerID1 = partnerID1;
            PartnerID2 = partnerID2;
            EventDesc = eventDesc;
            NumOfGuest = numOfGuest;
            EventDate = eventDate;
            EventLocation = eventLocation;
            EventLatitude = eventLatitude;
            EventLongitude = eventLongitude;
        }

        public int EventID { get => eventID; set => eventID = value; }
        public int PartnerID1 { get => partnerID1; set => partnerID1 = value; }
        public int PartnerID2 { get => partnerID2; set => partnerID2 = value; }
        public string EventDesc { get => eventDesc; set => eventDesc = value; }
        public int NumOfGuest { get => numOfGuest; set => numOfGuest = value; }
        public DateTime EventDate { get => eventDate; set => eventDate = value; }
        public string EventLocation { get => eventLocation; set => eventLocation = value; }
        public double EventLatitude { get => eventLatitude; set => eventLatitude = value; }
        public double EventLongitude { get => eventLongitude; set => eventLongitude = value; }


        public static void createNewEvent(Event NewEvent)
        {
            DBservices dbs = new DBservices();
             dbs.CreateNewEvent(NewEvent);
        }
        public static  List<Event> GetEvents(int PersonID)
        {
            DBservices dbs = new DBservices();
            return dbs.GetEvents(PersonID);
        }
        public static void updateEvent(Event NewEvent)
        {
            DBservices dbs = new DBservices();
            dbs.updateEvent(NewEvent);
        }
    }
}

