import appError from "../utilities/appError.js";
import venom from "venom-bot";
import sharp from "sharp";
import fs from "fs";
import path from "path";

async function saveQrWithWhiteBorder(base64Qr) {
  const base64Data = base64Qr.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // Create a white background and composite the QR code onto it
  const borderedImage = await sharp({
    create: {
      width: 285, // Adjust as needed
      height: 285,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // white
    },
  })
    .composite([
      {
        input: buffer,
        top: 10,
        left: 10,
      },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync("./uploads/qr_code.png", borderedImage);
}

class WhatsAppService {
  static instance;

  constructor() {
    if (WhatsAppService.instance) {
      return WhatsAppService.instance;
    }
    this.clientInstance = null;
    WhatsAppService.instance = this;
  }

  async initialize() {
    if (this.clientInstance) return;

    try {
      this.clientInstance = await venom.create(
        "sessionName",
        async (base64Qr, asciiQR, attempts) => {
          await saveQrWithWhiteBorder(base64Qr);
        },
        (statusSession) => {
          console.log("Session status:", statusSession);
        },
        {
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          logQR: false,
        }
      );
      console.log("WhatsApp session initialized successfully.");
    } catch (error) {
      throw new appError(`Failed to initialize WhatsApp session. ${error}`, 500);
    }
  }

  async sendMessage(phoneNumber, OTP) {
    if (!this.clientInstance) {
      const sessionPath = path.resolve(`./tokens/sessionName`);
      const sessionExists = fs.existsSync(sessionPath);

      if (sessionExists) {
        await this.initialize();
      } else {
        throw new appError(
          "WhatsApp client is not initialized. Call initialize() first.",
          500
        );
      }
    }

    try {
      const chatId = `${phoneNumber}@c.us`;
      await this.clientInstance.sendText(
        chatId,
        `Your OTP for Laundry Application: ${OTP}`
      );
    } catch (error) {
      throw new appError(`Failed to send OTP. ${error.message}`, 500);
    }
  }
}

const whatsAppService = new WhatsAppService();
export default whatsAppService;
