import nodemailer from "nodemailer";
import he from "he";

// Singleton transporter — reuse SMTP connections
let transporter: nodemailer.Transporter | null = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const safe = (str: string): string => he.encode(str);

export const sendOTPEmail = async (
  email: string,
  name: string,
  otp: string,
  type: "signup" | "login"
): Promise<void> => {
  const t = getTransporter();
  const safeName = safe(name);
  const subject =
    type === "signup"
      ? "Career DNA Profiler - Verify Your Account"
      : "Career DNA Profiler - Login OTP";

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 40px;">
        <h2 style="text-align: center; color: #1a1d2e; margin-bottom: 8px;">
          ${type === "signup" ? "Welcome to Career DNA Profiler!" : "Login Verification"}
        </h2>
        <p style="text-align: center; color: #334155; margin-bottom: 24px;">
          Hi ${safeName}, here is your OTP code:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; border: 2px solid #334155; color: #1a1d2e; font-size: 32px; font-weight: bold; letter-spacing: 12px; padding: 16px 32px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="text-align: center; color: #334155; font-size: 14px;">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    </div>
  `;

  await t.sendMail({
    from: `"Career DNA Profiler" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};
