import fastifyStatic from "@fastify/static";
import Fastify, { FastifyInstance } from "fastify";
import ejs from "ejs";
import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";

const pdfData = {
  ocrNumber: 426423791,
  invoiceNumber: 1,
  invoiceDate: "2024-05-16",
};

export const initServer = async (host: string, port: number) => {
  const server: FastifyInstance = Fastify();

  // Logo
  const logoPath = path.join(
    __dirname,
    "assets/images/utbetalning-logo-base64.txt"
  );
  const logo = fs.readFileSync(logoPath);

  // CSS
  const cssPath = path.join(__dirname, "assets/output.css");
  const css = "<style>" + fs.readFileSync(cssPath).toString() + "</style>";

  server.register(fastifyStatic, {
    root: path.join(__dirname, "assets"),
  });

  server.get("/", (request, reply) => {
    return reply.send("Hello world");
  });

  server.get("/pdf", (request, reply) => {
    const filePath = path.join(__dirname, "templates/invoice-template.ejs");
    ejs.renderFile(filePath, { data: pdfData }, async (err, str) => {
      if (err) {
        return reply.status(500).send(err);
      }
      return reply.send(str);
    });
  });

  server.post<{ Body: { invoice: any } }>(
    "/invoice",
    async (request, reply) => {
      const { invoice } = request.body;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Template
      const filePath = path.join(__dirname, "templates/invoice-template.ejs");
      const str = await ejs.renderFile(filePath, { data: pdfData, css, logo });
      await page.setContent(str);

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: false,
        preferCSSPageSize: true,
      });

      await browser.close();
      reply.type("application/pdf").send(pdf);
    }
  );

  // Start server
  try {
    server.listen({ port, host }, () =>
      console.log(`Listening on port ${port}...`)
    );
  } catch (err) {
    process.exit(1);
  }

  return { server };
};
