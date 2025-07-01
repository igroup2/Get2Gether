const api = "https://localhost:7035/api/"; // API URL

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      alert("נכנסת בהצלחה!");
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      alert("נרשמת בהצלחה!");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        createFireworks();
        alert("נכנסת בהצלחה!");
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        createFireworks();
        alert("נרשמת בהצלחה!");
      });
    }
  });
});

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

  class Firework {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.particles = [];
      this.createParticles();
    }

    createParticles() {
      const numParticles = 30;
      for (let i = 0; i < numParticles; i++) {
        this.particles.push(new Particle(this.x, this.y));
      }
    }

    update() {
      this.particles.forEach((particle, index) => {
        particle.update();
        if (particle.opacity <= 0) {
          this.particles.splice(index, 1);
        }
      });
    }

    draw() {
      this.particles.forEach((particle) => particle.draw());
    }
  }

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

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.opacity -= 0.02;
    }

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

  function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5; // מופיעים בחצי העליון
    fireworks.push(new Firework(x, y));
  }

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
