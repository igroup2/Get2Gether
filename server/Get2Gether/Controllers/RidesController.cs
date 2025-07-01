using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RidesController : ControllerBase
    {
        [HttpGet("{PersonID}")]
        public IActionResult Get(int PersonID)
        {
            try
            {
                var passengers = Ride.GetRidesByPerson(PersonID);
                return Ok(passengers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }



        // POST api/<RidesController>
        [HttpPost]
        public IActionResult Post([FromBody] List<Ride> NewRides)
        {
            Ride ride = new Ride();
            ride.insertPassengers(NewRides);
            return Ok(new { message = "Saved successfully" });
        }


        // PUT api/<RidesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // PUT api/<RidesController>/ApproveRide/5
        [HttpPut("ApproveRide/{rideID}")]
        public IActionResult ApproveRide(int rideID, [FromBody] int personID)
        {
            try
            {
                bool result = Ride.ApproveRide(rideID, personID);

                // גם אם לא שונתה שורה במסד – עדיין החזיר הצלחה
                if (result)
                    return Ok(new { message = "Ride status updated" });
                else
                    return Ok(new { message = "Ride status unchanged (possibly already approved)" }); // ✅ שורה חדשה במקום שגיאה
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }



        // DELETE api/<RidesController>/5
        [HttpDelete("{driverID}/{passengerID}/{eventID}")]
        public IActionResult deletePassengerByDriver(int driverID, int passengerID, int eventID)
        {
            try
            {
                Ride ride = new Ride();
                ride.deletePassengerByDriver(driverID, passengerID, eventID);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message); // ✅ תגובה במקרה שגיאה
            }
        }


    }
}
