using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RidesController : ControllerBase
    {
        [HttpGet("{eventID}/{driverID}")]
        public IActionResult Get(int eventID, int driverID)
        {
            try
            {
                var passengers = Ride.GetPassengerDetails(eventID, driverID);
                return Ok(passengers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }


        // GET api/<RidesController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
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

        // DELETE api/<RidesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
