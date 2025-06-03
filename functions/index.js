const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const {Resend} = require("resend");
const Email = require("email-templates");
const path = require("path");

// Define the secret
const resendApiKey = defineSecret("RESEND_API_KEY");

// Initialize email-templates
const email = new Email({
  views: {
    root: path.join(__dirname, "email-templates"),
    options: {
      extension: "pug",
    },
  },
});

// Example: Send a confirmation email when a new reservation is created
exports.sendReservationConfirmationEmail = onDocumentCreated(
    {
      document: "reservations/{reservationId}",
      secrets: [resendApiKey],
    },
    async (event) => {
      logger.log("Function triggered for reservation:",
          event.params.reservationId);

      try {
        const reservationData = event.data.data();
        logger.log("Reservation data:", reservationData);

        const userEmail = reservationData.email;
        const userName = reservationData.firstName;
        const bookingReference = reservationData.bookingReference;
        const bookingAddress = reservationData.address;
        const phone = reservationData.phone;
        const selectedDate = reservationData.selectedDate;
        const selectedTime = reservationData.selectedTime;
        const serviceType = reservationData.serviceType;
        const price = reservationData.price;

        if (!userEmail) {
          logger.error("No email found in reservation data.");
          return null;
        }

        logger.log("Sending email to:", userEmail);

        const locale = reservationData.locale || "fr";

        const emailContent = await email.renderAll(`${locale}/confirmation`, {
          userName,
          userEmail,
          bookingReference,
          bookingAddress,
          phone,
          selectedDate,
          selectedTime,
          serviceType,
          price,
        });

        const resend = new Resend(resendApiKey.value());
        const {data, error} = await resend.emails.send({
          from: "SuperVitre <support@supervitre.net>",
          to: [userEmail],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (error) {
          logger.error("Error sending email:", error);
          return null;
        }

        logger.log("Email sent successfully:", data);
        return data;
      } catch (e) {
        logger.error("Error in function execution:", e);
        return null;
      }
    },
);

// You can add other functions here, for example:
// exports.sendContactFormNotification =
//   onDocumentWritten("contacts/{contactId}", async (event) => { ... });
// exports.sendFeedbackReceivedEmail =
//   onDocumentWritten("feedbacks/{feedbackId}", async (event) => { ... });
