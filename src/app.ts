import express from "express";
import cors from "cors";
import {Resend} from "resend";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function createApp() {
  const app = express();
  app.use(express.json({ limit: "32kb" }));

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://singawaycareer.com",
    "https://www.singawaycareer.com",
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
      maxAge: 86400,
    }),
  );

  app.get("/", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json({ status: "ok" });
  });

  app.get("/health", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ status: "ok" });
  });

  app.post("/send-email", async (req, res) => {
    try {
      const {name, phone, email, service, message} = req.body;

      const response = await getResend().emails.send({
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
