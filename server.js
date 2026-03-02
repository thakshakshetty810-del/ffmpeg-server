import express from "express";
import { exec } from "child_process";
import fs from "fs";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
  try {
    const { input_url, command } = req.body;

    const inputPath = "input.mp4";
    const outputPath = "output.mp4";

    // Download video
    const response = await axios({
      url: input_url,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(inputPath);
    response.data.pipe(writer);
    await new Promise((resolve) => writer.on("finish", resolve));

    // Replace placeholders
    const finalCommand = command
      .replace(/\$\{input_video_path\}/g, inputPath)
      .replace(/\$\{output_video_path\}/g, outputPath);

    exec(finalCommand, (err) => {
      if (err) return res.status(500).send("FFmpeg failed");

      res.json({
        status: "done"
      });
    });

  } catch (e) {
    res.status(500).send("Error");
  }
});

app.listen(3000, () => console.log("Server running"));
