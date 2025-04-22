using System;
namespace Get2Gether.Models
{
	public class FinalMatch
	{
        public GiveRideRequest GiveRideRequests { get; set; }
        public RideRequest RideRequests { get; set; }
        public double detourMinutes { get; set; }

        public FinalMatch()
		{
		}
	}
}

