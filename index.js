const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
  res.render("form");
});

app.post("/generate", async (req, res) => {
  const { name, father_name, property_size, sale_amount, date } = req.body;

  const htmlContent = await ejs.renderFile("views/template.ejs", {
    name,
    father_name,
    property_size,
    sale_amount,
    date,
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const outputPath = path.join(__dirname, "generated", `${Date.now()}_sale_deed.pdf`);
  await page.pdf({ path: outputPath, format: "A4" });
  await browser.close();

  res.download(outputPath, "Sale_Deed.pdf", () => {
    // Optionally delete after download
    fs.unlinkSync(outputPath);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
