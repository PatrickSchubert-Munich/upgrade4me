import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import xss from "xss";

// Funktion zur Erfassung und Validierung der Formulardaten
const formData = (form) => {
  const formData = new FormData(form);

  // Bereinigung und Rückgabe der Formulardaten
  return {
    surname: formData.get("surname")?.trim() || "",
    name: formData.get("name")?.trim() || "",
    email: formData.get("email")?.trim() || "",
    telephone: formData.get("telephone")?.trim() || "",
    message: formData.get("message")?.trim() || "",
    feedback: formData.get("feedback")?.trim() || "false",
  };
};

// Funktion zur Validierung der Formulardaten
const validateParams = (params) => {
  if (typeof params !== "object" || Object.keys(params).length < 5) {
    throw new Error("Fehlende oder ungültige Parameter für die Email.");
  }

  // Sanitize (bereinigen) der Benutzereingaben mit der xss-Bibliothek
  const sanitizedContent = {
    surname: xss(params.surname),
    name: xss(params.name),
    email: xss(params.email),
    telephone: xss(params.telephone),
    message: xss(params.message),
    feedback: xss(params.feedback),
  };

  // Überprüfen, ob alle erforderlichen Felder vorhanden sind
  if (
    !sanitizedContent.surname ||
    !sanitizedContent.name ||
    !sanitizedContent.email ||
    !sanitizedContent.telephone ||
    !sanitizedContent.message ||
    !sanitizedContent.feedback
  ) {
    throw new Error("Fehlende erforderliche Parameter für die Email.");
  }
  return sanitizedContent;
};

const validateFeedbackParams = (message) => {
  if (!message || message.trim().length < 10) {
    throw new Error("Feedback muss mindestens 10 Zeichen lang sein");
  }

  return {
    surname: "Feedback",
    name: "Feedback-Formular",
    email: "feedback@upgrade4me.de",
    telephone: "-",
    message: xss(message.trim()),
    feedback: "true",
  };
};

// Validierung der Message-Länge
const validateMessage = (message) => {
  const minLength = 10;
  const maxLength = 500;
  const trimmedMessage = message.trim();

  if (trimmedMessage.length < minLength) {
    throw new Error(`Nachricht muss mindestens ${minLength} Zeichen lang sein`);
  }
  if (trimmedMessage.length > maxLength) {
    throw new Error(`Nachricht darf maximal ${maxLength} Zeichen lang sein`);
  }
  return trimmedMessage;
};

const submitDebounce = (() => {
  let timeout;
  return (callback, delay = 1000) => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  };
})();

// Funktion zur Initialisierung des Email-Services
const initEmailService = () => {
  try {
    emailjs.init("0NiQcSlDGygRWkUjE"); // Initialisiere mit dem Public Key
  } catch (error) {
    console.error("EmailJS Initialisierung fehlgeschlagen:", error);
  }
};

// Funktion zum Senden der E-Mail
const sendMail = async (templateParams, form, emailCheckbox, submitBtn) => {
  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton) submitButton.disabled = true;

  const standard_template = "template_ca7i3tb";
  const feedback_template = "template_ynrr82n";

  try {
    const response = await emailjs.send(
      "service_k44w9zj",
      templateParams.feedback === "true"
        ? standard_template
        : feedback_template,
      templateParams
    );

    const successConfig =
      templateParams.feedback === "true"
        ? {
            title: "Feedback erfolgreich gesendet.",
            text: "Vielen Dank für Ihr Feedback.",
          }
        : {
            title: "Email erfolgreich gesendet.",
            text: "Wir werden uns schnellstmöglich bei Ihnen melden.",
          };

    await Swal.fire({
      ...successConfig,
      icon: "success",
      timer: 3000,
      timerProgressBar: true,
    });

    form.reset();
    if (emailCheckbox) emailCheckbox.checked = false;
  } catch (error) {
    console.error("Fehler beim Senden der Email:", error);
    await Swal.fire({
      title: "Fehler beim Senden",
      text: "Bitte versuchen Sie es später erneut.",
      icon: "error",
      timer: 3000,
    });
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
};

// Setze ein Ablaufdatum für das Feedback (z.B. 30 Tage)
const setFeedbackExpiration = () => {
  const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 Tage in Millisekunden
  const now = new Date();
  const expirationDate = new Date(now.getTime() + expirationTime).toISOString(); // Ablaufdatum

  try {
    localStorage.setItem("feedbackExpiration", expirationDate);
    localStorage.setItem("feedbackGiven", now.toISOString()); // Speichern des Feedbacks
  } catch (error) {
    console.error("Fehler beim Setzen des Feedback-Ablaufs: ", error);
  }
};

// Überprüfe, ob das Feedback abgelaufen ist oder bereits abgegeben wurde
const checkFeedbackStatus = () => {
  try {
    const feedbackGiven = localStorage.getItem("feedbackGiven");
    const feedbackExpiration = localStorage.getItem("feedbackExpiration");

    if (!feedbackGiven || !feedbackExpiration) {
      return false;
    }

    const expirationDate = new Date(feedbackExpiration);
    const currentDate = new Date();

    // Überprüfe, ob das Ablaufdatum überschritten wurde
    if (currentDate > expirationDate) {
      // Ablaufdatum überschritten, Feedback kann erneut abgegeben werden
      return false;
    }

    // Feedback wurde bereits abgegeben und ist noch nicht abgelaufen
    return true;
  } catch (error) {
    console.error("Fehler beim Überprüfen des Feedback-Status: ", error);
    return false;
  }
};


const handleFeedbackSubmit = async (feedbackForm) => {
  const submitButton = feedbackForm.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  submitButton.style.opacity = 0.5; // Button Opazität anpassen, wenn deaktiviert

  try {
    // Überprüfe, ob das Feedback bereits abgegeben wurde und ob es abgelaufen ist
    const feedbackStatus = checkFeedbackStatus();

    if (feedbackStatus) {
      // Zeige eine Nachricht an, dass der Benutzer schon Feedback abgegeben hat
      await Swal.fire({
        title: "Feedback bereits abgegeben",
        text: "Du hast bereits Feedback abgegeben. Danke für deine Teilnahme!",
        icon: "info",
        timer: 3000,
      });
      return; // Beende die Funktion, um weiteres Absenden zu verhindern
    }

    const messageElement = feedbackForm.querySelector("[name='feedback']");
    const message = messageElement.value.trim();

    // Neue Validierung und Parameteraufbereitung
    const sanitizedParams = validateFeedbackParams(message);

    // Sende die E-Mail
    await sendMail(sanitizedParams, feedbackForm);

    // Speichere das Feedback und setze das Ablaufdatum
    setFeedbackExpiration();

    // Optional: Formular zurücksetzen
    feedbackForm.reset();
  } catch (error) {
    console.error("Feedback-Fehler:", error);

    await Swal.fire({
      title: "Feedback konnte nicht gesendet werden",
      text: error.message || "Bitte versuchen Sie es später erneut.",
      icon: "error",
      timer: 3000,
    });
  } finally {
    submitButton?.removeAttribute("disabled");
    submitButton.style.opacity = 1; // Setze die Opazität zurück, wenn der Button wieder aktiviert wird
  }
};


// Event Listener für DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  // Initialisiere den Email-Service
  initEmailService();

  // DOM-Elemente für die Checkbox und den Submit-Button
  const emailCheckbox = document.querySelector(".checkbox-email");
  const submitBtn = document.querySelector(".btn-submit-email");

  // Event Listener für die Checkbox, um den Submit-Button zu aktivieren/deaktivieren
  emailCheckbox.addEventListener("change", () => {
    submitBtn.disabled = !emailCheckbox.checked;
    submitBtn.classList.toggle("active", emailCheckbox.checked);
  });

  // Event Listener für das Absenden des Formulars Kontakt
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitDebounce(async () => {
      try {
        // Formulardaten sammeln und validieren
        const params = formData(form);
        const sanitizedParams = validateParams(params);
        if (sanitizedParams.feedback === "false") {
          // Sende die E-Mail with checkbox check
          sendMail(sanitizedParams, form, emailCheckbox, submitBtn);
          emailCheckbox.checked = false;
          submitBtn.disabled = true;
        }
        form.reset();
      } catch (error) {
        console.error(
          "Fehler bei der Formularverarbeitung Kontakt-Form:",
          error
        );
        Swal.fire({
          title:
            "Deine Nachricht kann derzeit leider nicht verarbeitet werden.",
          text: "Wir bitten vielmals um Entschuldigung!",
          icon: "error",
          timer: 3000,
        });
      }
    });
  });

  // Event Listener für das Absenden des Formulars Feedback
  const feedbackForm = document.querySelector(".feedback-form");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitDebounce(() => handleFeedbackSubmit(event.target));
    });
  }
});
