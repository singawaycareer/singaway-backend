import express from "express";
import cors from "cors";
import {Resend} from "resend";

export async function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "https://singawaycareer.com",
    }),
  );
  app.use(express.json());

  const resend = new Resend(process.env.RESEND_API_KEY);

  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  app.post("/send-email", async (req, res) => {
    try {
      const {name, mobile, email, service, message} = req.body;

      const response = await resend.emails.send({
        from: "SingAway Career <noreply@singawaycareer.com>",
        to: "singawaycareer@gmail.com",
        subject: "New Enquiry",
        html: `
          <p>Name: ${name}</p>
          <p>Mobile: ${mobile}</p>
          <p>Email: ${email}</p>
          <p>Service: ${service}</p>
          <p>Message: ${message}</p>
        `,
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  });

  return app;
}
