using System;
namespace Get2Gether.Models
{
    public class GuestInEvent
	{
        int personInEventID;
        int personID;
        int eventID;
        string roleInEvent;
        int numOfGuest;
        string rsvpStatus;

        public GuestInEvent()
		{
		}

        public GuestInEvent(int personInEventID, int personID, int eventID, string roleInEvent, int numOfGuest, string rsvpStatus)
        {
            PersonInEventID = personInEventID;
            PersonID = personID;
            EventID = eventID;
            RoleInEvent = roleInEvent;
            NumOfGuest = numOfGuest;
            RsvpStatus = rsvpStatus;
        }

        public int PersonInEventID { get => personInEventID; set => personInEventID = value; }
        public int PersonID { get => personID; set => personID = value; }
        public int EventID { get => eventID; set => eventID = value; }
        public string RoleInEvent { get => roleInEvent; set => roleInEvent = value; }
        public int NumOfGuest { get => numOfGuest; set => numOfGuest = value; }
        public string RsvpStatus { get => rsvpStatus; set => rsvpStatus = value; }
    }
}

