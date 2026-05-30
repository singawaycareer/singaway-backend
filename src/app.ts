import express from "express";
import cors from "cors";
import {Resend} from "resend";

export async function createApp() {
  const app = express();
  app.use(express.json());

  const allowedOrigins = [
    process.env.FRONTEND_URL, // e.g. https://www.singawaycareer.com
    "https://singawaycareer.com", // optional non-www
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow server-to-server / curl / health checks without Origin header
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  app.get("/", (_req, res) => {
    res.json({
      name: "SingAway Career API",
      status: "ok",
      site: "https://www.singawaycareer.com",
      docs: "https://www.singawaycareer.com/llms.txt",
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/send-email", async (req, res) => {
    try {
      const {name, phone, email, service, message} = req.body;

      const response = await resend.emails.send({
        from: "SingAway Career <noreply@singawaycareer.com>",
        to: "singawaycareer@gmail.com",
        subject: "New Enquiry",
        html: `
          <p>Name: ${name}</p>
          <p>Phone: ${phone}</p>
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
