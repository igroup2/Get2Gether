using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    public class ShuttlesController : Controller
    {
        // GET: api/values
        [HttpGet]
        public List<Shuttle> GetALLShuttles(int EventID)
        {
            Shuttle s = new Shuttle();
            return s.GetALLShuttles(EventID);
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        [HttpPost]
        public IActionResult Post([FromBody] Shuttle shuttle)
        {
            if (shuttle == null)
                return BadRequest("Shuttle object is null.");

            try
            {
                Shuttle s = new Shuttle();
                bool result = s.CreateNewShuttle(shuttle);

                if (result)
                    return Ok(new { message = "Shuttle created successfully." });
                else
                    return StatusCode(500, "Failed to create shuttle.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשרת: {ex.Message}");
            }
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        [HttpDelete("{id}")]
        public bool Delete([FromRoute] int id)
        {
            Shuttle s = new Shuttle();
            return s.DeleteShuttle(id);
        }

    }
}

