using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Get2Gether.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    public class AlgosController : Controller
    {
        // GET: api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        // 
        [HttpPost]
        public List<FinalMatch> RunAlgo([FromBody]List<FinalMatch> match, [FromQuery] double maxS)
        {
            Algo algo = new Algo();
            return algo.CalculateDistanceScore(match,maxS);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}

