const speech = require("@google-cloud/speech");
const fs = require("fs");

const client = new speech.SpeechClient({
    keyFilename: "path/to/your-google-cloud-key.json",
});

const transcribeAudio = async (filePath) => {
    try {
        const file = fs.readFileSync(filePath);
        const audioBytes = file.toString("base64");

        const request = {
            audio: { content: audioBytes },
            config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" },
        };

        const [response] = await client.recognize(request);
        return response.results.map((result) => result.alternatives[0].transcript).join("\n");
    } catch (error) {
        console.error("Error processing speech:", error);
        throw new Error("Speech recognition failed");
    }
};

module.exports = transcribeAudio;