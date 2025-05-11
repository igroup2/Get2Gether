namespace Get2Gether.Models
{
    public class Person
    {
        public int PersonID { get; set; }
        public string FullName { get; set; }
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public bool Smoke { get; set; }
        public string Gender { get; set; }

        public Person() { }

        public Person(int personID, string fullName, string password, string phoneNumber, bool smoke, string gender)
        {
            PersonID = personID;
            FullName = fullName;
            Password = password;
            PhoneNumber = phoneNumber;
            Smoke = smoke;
            Gender = gender;
        }

        public static void createNewPerson(Person p)
        {
            DBservices dbs = new DBservices();
            dbs.CreateNewPerson(p);
        }

        public int logInUser(string password, string phoneNum)
        {
            DBservices dbs = new DBservices();
            return dbs.logInUser(password, phoneNum);
        }
    }
}
