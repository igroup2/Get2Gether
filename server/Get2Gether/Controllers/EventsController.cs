using Microsoft.AspNetCore.Mvc;
using Get2Gether.Models;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;


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
        [HttpGet]
        public Event GetEventDetails(int eventID)
        {

            return Event.GetEventDetails(eventID);
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

        // Upload invite image
        [HttpPost("UploadInviteImage")]
        public async Task<IActionResult> UploadInviteImage([FromForm] IFormFile inviteImage, [FromForm] string fileName, [FromForm] int eventID)
        {
            if (inviteImage == null || inviteImage.Length == 0)
                return BadRequest("לא נבחר קובץ");

            // יצירת שם קובץ ייחודי לפי eventID
            string extension = Path.GetExtension(fileName);
            string newFileName = $"invite_{eventID}{extension}";
            string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "invites");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);
            string filePath = Path.Combine(folderPath, newFileName);

            // שמירת הקובץ ב-wwwroot/invites
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await inviteImage.CopyToAsync(stream);
            }

            // שמירת שם התמונה ב-SQL לפי eventID
            DBservices db = new DBservices();
            db.UpdateInviteImageName(eventID, newFileName); // יש להוסיף את הפונקציה הזו ב-DBservices

            // החזרת URL יחסי ללקוח
            string imageUrl = $"/invites/{newFileName}";
            return Ok(new { inviteImageUrl = imageUrl });
        }
    }
}
