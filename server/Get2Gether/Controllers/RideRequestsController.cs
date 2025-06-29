using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RideRequestsController : ControllerBase
    {
        // GET: api/<RideRequestsController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<RideRequestsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<RideRequestsController>
        [HttpPost]
        public void Post(
            [FromBody] RideRequest request,
            [FromQuery] string gender,
            [FromQuery] bool smoke)
        {

            RideRequest r = new RideRequest();
            r.CreateNewRequest(request, gender,smoke); 

            HttpContext.Response.ContentType = "application/json";
            HttpContext.Response.WriteAsync("{}");
        }


        // PUT api/<RideRequestsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<RideRequestsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
