using Microsoft.AspNetCore.Mvc;
using Get2Gether.Models;
using System.Collections.Generic;


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
        [HttpPut]
        public void Put([FromBody] Event e)
        {
            Models.Event.updateEvent(e);
            
        }

        // DELETE api/<EventsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
