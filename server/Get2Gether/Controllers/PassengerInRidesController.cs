using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PassengerInRidesController : ControllerBase
    {
        // GET: api/<PassengerInRidesController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<PassengerInRidesController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<PassengerInRidesController>
        [HttpPost]
        public void Post([FromBody] PassengerInRide newPass)
        {
       
        }

        // PUT api/<PassengerInRidesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<PassengerInRidesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
