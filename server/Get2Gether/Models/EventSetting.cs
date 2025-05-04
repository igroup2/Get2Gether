using System;
namespace Get2Gether.Models
{
	public class EventSetting
	{
		 int eventID;
		 double distanceFirstFilter;
		 double detourTime; // זמן הסטייה לאיסוף אדם
         double distanceWeight;
		 double smokingPreferenceWeight;
		 double genderPreferenceWeight;
		 double familyRelationWeight;
         double lonleyWeight;

        public EventSetting()
		{
		}

        public EventSetting(int eventID, double distanceFirstFilter, double detourTime, double distanceWeight, double smokingPreferenceWeight, double genderPreferenceWeight, double familyRelationWeight, double lonleyWeight)
        {
            EventID = eventID;
            DistanceFirstFilter = distanceFirstFilter;
            DetourTime = detourTime;
            DistanceWeight = distanceWeight;
            SmokingPreferenceWeight = smokingPreferenceWeight;
            GenderPreferenceWeight = genderPreferenceWeight;
            FamilyRelationWeight = familyRelationWeight;
            LonleyWeight = lonleyWeight;
        }

        public int EventID { get => eventID; set => eventID = value; }
        public double DistanceFirstFilter { get => distanceFirstFilter; set => distanceFirstFilter = value; }
        public double DetourTime { get => detourTime; set => detourTime = value; }
        public double DistanceWeight { get => distanceWeight; set => distanceWeight = value; }
        public double SmokingPreferenceWeight { get => smokingPreferenceWeight; set => smokingPreferenceWeight = value; }
        public double GenderPreferenceWeight { get => genderPreferenceWeight; set => genderPreferenceWeight = value; }
        public double FamilyRelationWeight { get => familyRelationWeight; set => familyRelationWeight = value; }
        public double LonleyWeight { get => lonleyWeight; set => lonleyWeight = value; }

        static public EventSetting GetEventSettings (int EventID)
        {
            DBservices dbs = new DBservices();
            return dbs.GetEventSettings(EventID);
        }

        static public int UpdateEventSettings(EventSetting EventSetToUP)
        {
            DBservices dbs = new DBservices();
           return dbs.UpdateEventSettings(EventSetToUP);
        }
    }
}

