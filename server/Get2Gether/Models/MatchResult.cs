namespace Get2Gether.Models
{
    public class MatchResult
    {
        public GiveRideRequest Driver { get; set; }
        public List<RideRequest> PotentialRiders { get; set; }
    }
}
