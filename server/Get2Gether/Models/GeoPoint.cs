using System;

namespace Get2Gether.Models
{
    public class GeoPoint
    {
        public double Y { get; set; }
        public double X { get; set; }

        public GeoPoint() { }

        public GeoPoint(double latitude, double longitude)
        {
            Y = latitude;
            X = longitude;
        }
    }
}
