using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GuestInEventsController : ControllerBase
    {
        [HttpPost("UploadExcel/{eventId}")]
        public IActionResult UploadExcel([FromRoute] int eventId, IFormFile excelFile)
        {

            if (excelFile == null || excelFile.Length == 0)
                return BadRequest("לא נבחר קובץ");

            try
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial; // חובה לשימוש ב־EPPlus

                using var stream = excelFile.OpenReadStream();
                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets[0]; // הגיליון הראשון

                var db = new DBservices();

                List<GuestInEvent> guestList = new();

                for (int row = 3; row <= worksheet.Dimension.End.Row; row++)
                {
                    string fullName = worksheet.Cells[row, 1].Text.Trim();
                    string phone = worksheet.Cells[row, 2].Text.Trim();
                    string guestsCountText = worksheet.Cells[row, 3].Text.Trim();
                    string relation = worksheet.Cells[row, 4].Text.Trim();     // חברים / משפחה
                    string side = worksheet.Cells[row, 5].Text.Trim();         // מהצד של...
                    string rsvp = worksheet.Cells[row, 6].Text.Trim();         // סטטוס הגעה

                    if (string.IsNullOrEmpty(fullName)) continue;

                    // 1. יצירת Person
                    var person = new Person
                    {
                        FullName = fullName,
                        PhoneNumber = phone,
                        Password = "1234",     // סיסמה זמנית
                        Smoke = false,
                        Gender = "N",
                        // ערך ברירת מחדל
                    };

                    int personId = db.CreateGuests(person);
                    if (personId <= 0) continue;

                    // 2. יצירת GuestInEvent
                    var guest = new GuestInEvent
                    {
                        PersonID = personId,
                        EventID = eventId,
                        RoleInEvent = "Guest", // תמיד Guest
                        NumOfGuest = int.TryParse(guestsCountText, out int count) ? count : 1,
                        RsvpStatus = rsvp,
                        SideInWedding = side,
                        RelationToCouple = relation
                    };
                    guestList.Add(guest);
                }

                // 3. הכנסת כל ה־GuestInEvent למסד הנתונים
                db.CreateGuestsInEvent(guestList);

                return Ok("הקובץ הועלה, ועובד בהצלחה");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }
        [HttpGet("RideRequestsCount")]
        public int GetRideRequestsCount([FromQuery] int eventID)
        {
            return GuestInEvent.GetRequestsCount(eventID);
        }

        [HttpGet("GiveRideRequestsCount")]
        public int GetGiveRideRequestsCount([FromQuery] int eventID)
        {
            return GuestInEvent.GetGiveRideRequestsCount(eventID);
        }
        [HttpGet("RSVPChartData")]
        public IActionResult GetRSVPChartData([FromQuery] int eventID)
        {
            var results = GuestInEvent.GetRSVPStatusCounts(eventID);

            var chartData = results.Select(r => new
            {
                status = r.Status,
                count = r.Count
            });

            return Ok(chartData);
        }




        // POST api/<GuestInEventsController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<GuestInEventsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<GuestInEventsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
