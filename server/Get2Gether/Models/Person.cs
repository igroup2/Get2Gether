using System;
namespace Get2Gether.Models
{
    public class Person
	{
        int personID;
        string fullName;
        string password;
        private string phoneNumber;
        bool smoke;
        string gender;
        string sideInWedding;
        string relationToCouple;

        public Person(){ }

        public Person(int personID, string fullName,string password, string phoneNumber, bool smoke, string gender, string sideInWedding, string relationToCouple)
        {
            PersonID = personID;
            FullName = fullName;
            Password = password;
            PhoneNumber = phoneNumber;
            Smoke = smoke;
            Gender = gender;
            SideInWedding = sideInWedding;
            RelationToCouple = relationToCouple;
        }

        public int PersonID { get => personID; set => personID = value; }
        public string FullName { get => fullName; set => fullName = value; }
        public string Password { get => password; set => password = value; }
        public string PhoneNumber { get => phoneNumber; set => phoneNumber = value; }
        public bool Smoke { get => smoke; set => smoke = value; }
        public string Gender { get => gender; set => gender = value; }
        public string SideInWedding { get => sideInWedding; set => sideInWedding = value; }
        public string RelationToCouple { get => relationToCouple; set => relationToCouple = value; }



        static public void createNewPerson(string fullName, string phoneNumber, char gender, string password)
        {
            DBservices dbs = new DBservices();
             dbs.CreateNewPerson(fullName, phoneNumber, gender, password);
        }
        public int logInUser(string password, string phoneNum)
        {
            DBservices dbs = new DBservices();
            return dbs.logInUser(password, phoneNum);
        }

    }
}

