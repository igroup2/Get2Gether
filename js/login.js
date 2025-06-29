// login.js
const api = "https://localhost:7035/api/";

$(document).ready(function () {
  $("#loginForm").submit((event) => {
    event.preventDefault();
    Login();
  });
});

function Login() {
  let user = {
    phone: $("#phone").val(),
    password: $("#password").val(),
  };
  if (user.phone == "" || user.password == "") {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "אנא מלא את כל השדות",
      showConfirmButton: true,
    });
    return;
  }
  ajaxCall(
    "GET",
    api + `Persons/login?phone=${user.phone}&password=${user.password}`,
    null,
    (response) => {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "התחברת בהצלחה",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        if (response == 1) {
          window.location.href = "Admin.html";
        } else {
          window.location.href = "index.html";
        }
      });
    },
    (error) => {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "התחברות נכשלה",
        text: "בדוק את הפרטים ונסה שוב.",
        showConfirmButton: true,
      });
    }
  );
}
