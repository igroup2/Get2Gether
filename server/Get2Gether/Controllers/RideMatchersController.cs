﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Get2Gether.Models;



// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Get2Gether.Controllers
{
    [Route("api/[controller]")]
    public class RideMatchersController : Controller
    {
        // GET: api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        [HttpGet("cities")]
        public List<string> GetCities()

        {
            RideMatcher matcher = new RideMatcher();    
            return matcher.GetCities(); 
        }
        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        [HttpPost]
        public RideMatcher Post( int id )
        {
            RideMatcher rideMatcher = new RideMatcher();
            return rideMatcher.GetALLRequests(id);
        }

        [HttpPost("Filter")]
        public List<MatchResult> Filter([FromBody] RideMatcher rideMatcher)
        {
            return rideMatcher.FilterRideRequests();
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

