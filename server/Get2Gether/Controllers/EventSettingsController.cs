using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    public class EventSettingsController : ControllerBase
    {
        // GET: api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{EventID}")]
        public EventSetting GetEventSettings(int EventID)
        {
            return EventSetting.GetEventSettings(EventID);
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        [HttpPut("UpdateEventSettings")]
        public IActionResult UpdateEventSettings([FromBody] EventSetting eventToUpdate)
        {
            try
            {
                int result = new DBservices().UpdateEventSettings(eventToUpdate);

                switch (result)
                {
                    case 1:
                        return Ok(new { message = "ההגדרות עודכנו בהצלחה." });
                    case -1:
                        return NotFound(new { message = "אירוע לא נמצא." });
                    case -2:
                        return BadRequest(new { message = "סכום המשקלים חורג מהמותר." });
                    default:
                        return StatusCode(500, new { message = "שגיאה לא ידועה." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "שגיאה בשרת: " + ex.Message });
            }
        }


        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}

