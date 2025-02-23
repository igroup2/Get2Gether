document.addEventListener("DOMContentLoaded", function () {
  let currentStep = 0;
  const steps = document.querySelectorAll(".form-step");

  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === stepIndex);
    });
  }

  window.nextStep = function () {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  };

  window.prevStep = function () {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  };

  showStep(currentStep);

  document
    .getElementById("multiStepForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      alert("ההרשמה הושלמה בהצלחה!");
    });
});

function updateImage(selectId, imgId) {
  const gender = document.getElementById(selectId).value;
  const imgElement = document.getElementById(imgId);

  if (gender === "male") {
    imgElement.src = "../images/groom.webp"; // התמונה של החתן
  } else if (gender === "female") {
    imgElement.src = "../images/bride.webp"; // התמונה של הכלה
  } else {
    imgElement.src = ""; // אם לא נבחר כלום, מוחקים את התמונה
  }
}
