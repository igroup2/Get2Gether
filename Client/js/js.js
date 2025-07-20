// אתחול עמוד, טיפול בטפסי התחברות/הרשמה והפעלת זיקוקים
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    // מאזין לטופס התחברות ומציג הודעה
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      alert("נכנסת בהצלחה!");
    });
  }

  if (registerForm) {
    // מאזין לטופס הרשמה ומציג הודעה
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      alert("נרשמת בהצלחה!");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
      // מאזין לטופס התחברות ומפעיל זיקוקים
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        createFireworks();
        alert("נכנסת בהצלחה!");
      });
    }

    if (registerForm) {
      // מאזין לטופס הרשמה ומפעיל זיקוקים
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        createFireworks();
        alert("נרשמת בהצלחה!");
      });
    }
  });
});

// אתחול קנבס זיקוקים והפעלת אנימציה
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // מחלקה ליצירת זיקוק
  class Firework {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.particles = [];
      this.createParticles();
    }

    // יוצר חלקיקים לזיקוק
    createParticles() {
      const numParticles = 30;
      for (let i = 0; i < numParticles; i++) {
        this.particles.push(new Particle(this.x, this.y));
      }
    }

    // מעדכן מצב כל חלקיק בזיקוק
    update() {
      this.particles.forEach((particle, index) => {
        particle.update();
        if (particle.opacity <= 0) {
          this.particles.splice(index, 1);
        }
      });
    }

    // מצייר את כל החלקיקים בזיקוק
    draw() {
      this.particles.forEach((particle) => particle.draw());
    }
  }

  // מחלקה ליצירת חלקיק של זיקוק
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 2;
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 4 - 2;
      this.gravity = 0.05;
      this.opacity = 1;
      this.color = `rgba(192,192,192,${this.opacity})`; // צבע כסוף מנצנץ
    }

    // מעדכן מיקום, מהירות ושקיפות של חלקיק
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.opacity -= 0.02;
    }

    // מצייר חלקיק על הקנבס
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
      ctx.fill();
    }
  }

  let fireworks = [];

// יוצר זיקוק חדש במיקום אקראי
function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5; // מופיעים בחצי העליון
    fireworks.push(new Firework(x, y));
  }

// מפעיל את אנימציית הזיקוקים בלולאה
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworks.forEach((firework, index) => {
      firework.update();
      firework.draw();
      if (firework.particles.length === 0) {
        fireworks.splice(index, 1);
      }
    });
    requestAnimationFrame(animate);
  }

  setInterval(createFirework, 2000); // יצירת זיקוקים כל 2 שניות
  animate();
});
