const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 5000;

app.use(cors());


const storage = multer.memoryStorage();
const upload = multer({ storage }).array("images", 10); 


const generativeAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post("/api/myracle", upload, async (req, res) => {
  try {
    const { context } = req.body;
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

   
    const formattedImages = uploadedFiles.map((file) => ({
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    }));

    
    let descriptionPrompt = `
      Generate detailed test cases based on the provided screenshots ${
        context ? `with the following additional context: ${context}` : ""
      }.
      - Each test case should provide a comprehensive, step-by-step guide on testing each feature.
      Include the following elements in each test case:
      - Description: What the test case is testing.
      - Pre-conditions: Necessary setups or conditions before testing.
      - Testing Steps: Step-by-step instructions for executing the test.
      - Expected Result: What outcome should occur if the functionality works as expected.

      Use the screenshots provided to identify distinct test cases for each visual feature presented in the images.
    `;

    // Include formatted images in the input
    const inputData = [descriptionPrompt, ...formattedImages];

    // Fetch the generative model and generate content based on the input data
    const model = generativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const output = await model.generateContent(inputData);

    
    res.json({ description: output.response.text() });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ error: "Failed to generate test case descriptions" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
