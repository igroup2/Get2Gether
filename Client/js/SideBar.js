// פונקציה שמטפלת בפתיחה וסגירה של הסיידבר לפי לחיצות
$(document).ready(function () {
  $("#actionsToggle").on("click", function (e) {
    e.preventDefault();
    $("#actionsSidebar").toggleClass("open");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#actionsSidebar, #actionsToggle").length) {
      $("#actionsSidebar").removeClass("open");
    }
  });
});

// פונקציה שמבצעת פתיחה/סגירה של הסיידבר בלחיצה
function toggleSidebar() {
  document.getElementById("actionsSidebar").classList.toggle("open");
}
