async function sendVerificationEmail(userEmail, token) {
  const verificationLink = `http://localhost:3000/api/auth/verify?token=${token}`;

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

export { sendVerificationEmail };
