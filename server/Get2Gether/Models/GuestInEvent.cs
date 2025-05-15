using System;
namespace Get2Gether.Models
{
    public class GuestInEvent
	{
        public int PersonInEventID { get; set; }
        public int PersonID { get; set; }
        public int EventID { get; set; }
        public string RoleInEvent { get; set; }
        public int NumOfGuest { get; set; }
        public string RsvpStatus { get; set; }

        public string SideInWedding { get; set; }
        public string RelationToCouple { get; set; }       
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

   
    }
}

