using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {

        [HttpPost("InviteImage")]
        public async Task<IActionResult> UploadInviteImage(IFormFile inviteImage, [FromForm] int eventID)
        {
            if (inviteImage == null || inviteImage.Length == 0)
            {
                return BadRequest("לא התקבלה תמונה");
            }

            // קח את הסיומת המקורית של הקובץ (jpg / png)
            var extension = Path.GetExtension(inviteImage.FileName).ToLower();

            // רק קבצי תמונה מותרים
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("פורמט קובץ לא נתמך. רק JPG או PNG מותרים.");
            }

            // צור את השם הקבוע של הקובץ
            var fileName = $"event_{eventID}{extension}";

            // נתיב לשמירה בתיקייה wwwroot/invites
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "invites");

            // ודא שהתיקייה קיימת
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // שמור את הקובץ תוך דריסת הקודם אם קיים
            var filePath = Path.Combine(uploadsPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await inviteImage.CopyToAsync(stream);
            }

            // החזר ללקוח את הנתיב היחסי
            var relativePath = $"/invites/{fileName}";
            return Ok(new { inviteImageUrl = relativePath });
        }


        // GET: api/<UploadController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<UploadController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<UploadController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<UploadController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UploadController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
