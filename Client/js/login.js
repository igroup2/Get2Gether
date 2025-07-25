
// אתחול עמוד התחברות והאזנה לטופס
$(document).ready(function () {
  $("#loginForm").submit((event) => {
    event.preventDefault();
    Login();
  });
});

// מבצע התחברות לפי טופס ושולח נתונים לשרת
function Login() {
  let user = {
    phone: $("#phone").val(),
    password: $("#password").val(),
  };

  if (user.phone === "" || user.password === "") {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "אנא מלא את כל השדות",
      showConfirmButton: true,
    });
    return;
  }

  // קריאת AJAX: שולחת נתוני התחברות לשרת ומקבלת תשובה
  ajaxCall(
    "GET",
    api + `Persons/login?phone=${user.phone}&password=${user.password}`,
    null,
    (response) => {
      console.log("🔐 תשובת התחברות:", response);

      if (response === 1) {
        // התחברות כאדמין
        Swal.fire({
          position: "center",
          icon: "success",
          title: "התחברת כאדמין",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          window.location.href = "Admin.html";
        });
      } else if (response > 1) {
        // התחברות כמשתמש רגיל
        // שמור personID ו-Role=Host
        localStorage.setItem("personID", response);
        localStorage.setItem("Role", "Host");
        Swal.fire({
          position: "center",
          icon: "success",
          title: "התחברת בהצלחה",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          window.location.href = "events.html";
        });
      } else {
        // שגיאת התחברות
        Swal.fire({
          position: "center",
          icon: "error",
          title: "פרטים שגויים",
          text: "משתמש לא קיים או סיסמה שגויה",
          showConfirmButton: true,
        });
      }
    },
    (error) => {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "שגיאת שרת",
        text: "לא ניתן להתחבר כרגע. נסה שוב מאוחר יותר.",
        showConfirmButton: true,
      });
    }
  );
}
