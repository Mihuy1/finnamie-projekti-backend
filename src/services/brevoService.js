async function sendVerificationEmail(userEmail, token) {
  const verificationLink = `http://localhost:3000/api/auth/verify?token=${token}`;

  if (!process.env.BREVO_API_KEY) {
    console.warn(
      "Brevo API key is not set. Skipping email sending for verification.",
    );
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Finnamie",
        email: "fizhey@gmail.com", // Must be an authenticated sender in Brevo
      },
      to: [{ email: userEmail }],
      subject: "Please verify your email address",
      htmlContent: `
        <html>
          <body>
            <h2>Welcome to Finnamie!</h2>
            <p>Please click the link below to verify your account:</p>
            <a href="${verificationLink}">Verify My Account</a>
          </body>
        </html>
      `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to send email via Brevo:", errorData);
    throw new Error("Email sending failed");
  }
}

async function sendBookingInformationEmail(
  userEmail,
  timeslotDetails,
  experienceDetails,
) {
  if (!process.env.BREVO_API_KEY) {
    console.warn(
      "Brevo API key is not set. Skipping email sending for booking information.",
    );
    return;
  }

  if (!userEmail) {
    console.warn(
      "Email missing. Skipping email sending for booking information",
    );
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Finnamie",
        email: "fizhey@gmail.com", // Must be an authenticated sender in Brevo
      },
      to: [{ email: userEmail }],
      subject: "Your Booking Information",
      htmlContent: `
        <html>
          <body>
            <h2>Your Booking Details</h2>
            <p>Here are the details of your booking:</p>
            <ul>
              <li><strong>Experience:</strong> ${experienceDetails.title}</li>
              <li><strong>Timeslot:</strong> ${new Date(
                timeslotDetails.start_time,
              ).toLocaleString()} - ${new Date(
                timeslotDetails.end_time,
              ).toLocaleString()}</li>
              <li><strong>Location:</strong> ${experienceDetails.city}</li>
              <li><strong>Address:</strong> ${experienceDetails.address}</li>
              <li><strong>Description:</strong> ${experienceDetails.description}</li>
            </ul>
          </body>
        </html>
      `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to send email via Brevo:", errorData);
    throw new Error("Email sending failed");
  }
}

async function sendBookingNotificationToHost(
  hostEmail,
  user,
  timeslotDetails,
  experienceDetails,
) {
  if (!process.env.BREVO_API_KEY) {
    console.warn(
      "Brevo API key is not set. Skipping email sending for booking information.",
    );
    return;
  }

  if (!hostEmail) {
    console.warn("Email missing. Skipping email sending for host booking info");
    return;
  }

  const bookerName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.name ||
    "a guest";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Finnamie",
        email: "fizhey@gmail.com", // Must be an authenticated sender in Brevo
      },
      to: [{ email: hostEmail }],
      subject: `You have a new booking from ${bookerName}!`,
      htmlContent: `
        <html>
          <body>
            <h2>New Booking!</h2>
            <p>You have a new booking from <strong>${bookerName}</strong> for your experience <strong>${experienceDetails.title}</strong>.</p>
            <p>Here are the details of the booking:</p>
            <ul>
              <li><strong>Experience:</strong> ${experienceDetails.title}</li>
              <li><strong>Timeslot:</strong> ${new Date(
                timeslotDetails.start_time,
              ).toLocaleString()} - ${new Date(
                timeslotDetails.end_time,
              ).toLocaleString()}</li>
              <li><strong>Location:</strong> ${experienceDetails.city}</li>
              <li><strong>Address:</strong> ${experienceDetails.address}</li>
              <li><strong>Description:</strong> ${experienceDetails.description}</li>
            </ul>
          </body>
        </html>
      `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to send email via Brevo:", errorData);
    throw new Error("Email sending failed");
  }
}

async function sendPaymentVerificationEmail(userEmail) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("Brevo API key is not set.");
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Finnamie",
        email: "fizhey@gmail.com", // Must be an authenticated sender in Brevo
      },
      to: [{ email: userEmail }],
      subject: "Payment received",
      htmlContent: `
        <html>
          <body  style="text-align: center">
            <h2>Payment received</h2>
            <p>Your payment has been received by Finnamie.</p>
            <p>We hope that you have a wonderful time experiencing Finland!</p>
          </body>
        </html>
      `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to send email via Brevo:", errorData);
    throw new Error("Email sending failed");
  }
}

export {
  sendVerificationEmail,
  sendBookingInformationEmail,
  sendBookingNotificationToHost,
  sendPaymentVerificationEmail,
};
