using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GiveRideRequestsController : ControllerBase
    {
        // GET: api/<GiveRideRequestsController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<GiveRideRequestsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<GiveRideRequestsController>
        [HttpPost]
        public void Post([FromBody] GiveRideRequest giveRide)
        {
            Models.GiveRideRequest.CreateNewGiveRideRequest(giveRide);

            HttpContext.Response.ContentType = "application/json";
            HttpContext.Response.WriteAsync("{}");
        }

        // PUT api/<GiveRideRequestsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<GiveRideRequestsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
