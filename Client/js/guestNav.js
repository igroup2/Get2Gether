// guestNav.js
// This script updates the navigation for guests on all pages

// אתחול תפריט ניווט לאורח כאשר הדף נטען
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("Role") === "Guest") {
    var navLinks = document.getElementById("mainNavLinks");
    if (navLinks) {
      navLinks.innerHTML = `
        <li><a href="index.html#hero">בית</a></li>
        <li><a href="Events.html">האירועים שלי</a></li>
        <li><a href="index.html#feature">המוצרים שלנו</a></li>
        <li><a href="index.html#about">עלינו</a></li>
        <li><a href="index.html#how">צור קשר</a></li>
      `;
    }
    // Hide sidebar if exists
    var sidebar = document.getElementById("actionsSidebar");
    if (sidebar) sidebar.style.display = "none";
  }
});
