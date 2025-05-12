using Microsoft.AspNetCore.Mvc;
using Get2Gether.Models;


namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        // GET: api/<EventsController>
        [HttpGet("{PersonID}")]
        public List<Event> GetEvents(int PersonID)
        {

            return Event.GetEvents(PersonID);
        }


        // POST api/<EventsController>/createNewEvent
        [HttpPost]
        public int post([FromBody] Event NewEvent)
        {
            Event.createNewEvent(NewEvent);
            return NewEvent.EventID; 
        }

        // PUT api/<EventsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<EventsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
