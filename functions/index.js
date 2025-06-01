const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const {Resend} = require("resend");

// Initialize Resend with your API key
const resendApiKey = functions.config().resend.apikey;
if (!resendApiKey) {
  logger.error(
      "Resend API Key not found. Set it in Firebase Functions config: " +
      "firebase functions:config:set resend.apikey=\"YOUR_KEY\"",
  );
}
const resend = new Resend(resendApiKey);

// Example: Send a confirmation email when a new reservation is created
exports.sendReservationConfirmationEmail = onDocumentWritten(
    "reservations/{reservationId}",
    async (event) => {
    // Only trigger on document creation
      if (!event.data.after.exists || event.data.before.exists) {
        logger.log("Not a new document, skipping email.");
        return null;
      }

      const reservationData = event.data.after.data();
      const userEmail = reservationData.email;
      const userName = reservationData.firstName;
      const bookingReference = reservationData.bookingReference;

      if (!userEmail) {
        logger.error(
            "No email found in reservation data for ID:",
            event.params.reservationId,
        );
        return null;
      }

      logger.log(
          `Attempting to send confirmation email to: ${userEmail} ` +
        `for reservation: ${event.params.reservationId}`,
      );

      try {
        const emailHtml = `
        <h1>Bonjour ${userName || ""},</h1>
        <p>Merci d'avoir réservé chez SuperVitre !</p>
        <p>Votre numéro de réservation est : <strong>${
  bookingReference || "N/A"
}</strong>.</p>
        <p>Nous vous contacterons bientôt avec plus de détails.</p>
        <br/>
        <p>Cordialement,</p>
        <p>L'équipe SuperVitre</p>
      `;

        const {data, error} = await resend.emails.send({
          from: "SuperVitre <support@supervitre.net>", // Verified Resend domain
          to: [userEmail],
          subject: "Votre réservation chez SuperVitre est confirmée!",
          html: emailHtml,
        });

        if (error) {
          logger.error("Error sending email with Resend:", error);
          return null;
        }

        logger.log(
            "Confirmation email sent successfully to:",
            userEmail,
            "Email ID:",
            data.id,
        );
        return data;
      } catch (e) {
        logger.error("Exception caught while sending email:", e);
        return null;
      }
    },
);

// You can add other functions here, for example:
// exports.sendContactFormNotification =
//   onDocumentWritten("contacts/{contactId}", async (event) => { ... });
// exports.sendFeedbackReceivedEmail =
//   onDocumentWritten("feedbacks/{feedbackId}", async (event) => { ... });
