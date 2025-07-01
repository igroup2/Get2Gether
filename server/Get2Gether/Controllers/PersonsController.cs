using Microsoft.AspNetCore.Mvc;
using Get2Gether.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonsController : ControllerBase
    {
        // GET: api/<PersonsController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }
        [HttpPost("register")]
        public int register([FromBody] Person p)
        {
            try
            {
               Models.Person.createNewPerson(p);
                return p.PersonID; // תחזיר את ה-ID שנוצר אם הצליח
            }
            catch (Exception ex)
            {
                return 0;
            }

        }


        // POST api/<PersonsController>
          [HttpGet("login")]
             public int Login(string phone, string password)
             {
                  Person p = new Person();
                  return p.logInUser(phone, password);
             }


            // PUT api/<PersonsController>/5
            [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<PersonsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
