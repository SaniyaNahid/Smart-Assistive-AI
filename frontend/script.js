// Get elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const objectsOutput = document.getElementById("objects");
const textOutput = document.getElementById("text");
const contextOutput = document.getElementById("context");

let currentStream = null;

/* ==============================
   1. Start Camera
============================== */
async function startCamera() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = currentStream;
    } catch (error) {
        alert("Camera access denied or not available.");
        console.error(error);
    }
}

/* ==============================
   2. Capture Image
============================== */
function captureImage() {
    if (!video.srcObject) {
        alert("Start the camera first.");
        return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    alert("Image captured successfully!");
}

/* ==============================
   3. Send Image to Backend
============================== */
async function analyzeImage() {
    try {
        const imageData = canvas.toDataURL("image/png");

        if (!imageData) {
            alert("Capture an image first.");
            return;
        }

        objectsOutput.innerText = "Analyzing...";
        textOutput.innerText = "Analyzing...";
        contextOutput.innerText = "Analyzing...";

        const response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const result = await response.json();

        const objects = result.objects || "No objects detected.";
        const text = result.text || "No text detected.";
        const contextMessage = result.context || "No contextual message.";

        objectsOutput.innerText = objects;
        textOutput.innerText = text;
        contextOutput.innerText = contextMessage;

        speakResult(objects, text, contextMessage);

    } catch (error) {
        console.error(error);
        alert("Error connecting to backend. Make sure server is running.");
    }
}

/* ==============================
   4. Text-to-Speech
============================== */
function speakResult(objects, text, contextMessage) {
    const message = `
        Detected objects: ${objects}.
        Extracted text: ${text}.
        Context information: ${contextMessage}.
    `;

    const speech = new SpeechSynthesisUtterance(message);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}

/* ==============================
   5. Stop Camera (Optional)
============================== */
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}