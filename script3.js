const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Setup camera
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();

  video.addEventListener('loadeddata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
}

setupCamera();

// Load MediaPipe FaceMesh
// const faceMesh = new FaceMesh.FaceMesh({

const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });
  
  faceMesh.setOptions({
    maxNumFaces: 3,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  

const shinglesImage = new Image();
shinglesImage.src = 'HerpesZoster.png'; // Path to the shingles texture


faceMesh.onResults((results) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    if (results.multiFaceLandmarks) {
      results.multiFaceLandmarks.forEach((landmarks) => {
        // Define the region for just the left eye
        const leftEyeRegion = [33, 160, 159, 158, 144, 153, 154, 155]; // Left eye landmarks
  
        // Get the bounding box for the left eye region
        const points = leftEyeRegion.map((i) => landmarks[i]);
        const [x, y, width, height] = getBoundingBox(points);
  
        // Adjust the position and size of the bounding box to extend above the eye
        const margin = 20; // Base margin around the eye
        const foreheadHeight = 50; // Extend height towards the forehead
  
        ctx.drawImage(
          shinglesImage,
          x - margin,              // Left edge of the image
          y - margin - foreheadHeight, // Shift upwards by `foreheadHeight`
          width + margin * 1.6,      // Width including margin
          height + margin + foreheadHeight // Height including upward extension
        );


         // Create a half-closed eye effect by drawing a semi-transparent overlay
      // ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Dark semi-transparent color
      // const eyeOverlayHeight = height * 0.6; // Cover half the eye region
      // ctx.beginPath();
      // ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height); // Start at the top-left of the eye
      // points.forEach((point) => {
      //   ctx.lineTo(point.x * canvas.width, point.y * canvas.height); // Draw around the eye region
      // });
      // ctx.lineTo(points[0].x * canvas.width, points[0].y * canvas.height + eyeOverlayHeight); // Bottom edge for half-closed
      // ctx.closePath();
      // ctx.fill();
      });
    }
  });
  
  
  

// Helper function to calculate bounding box
function getBoundingBox(region) {
  const xCoords = region.map((p) => p.x * canvas.width);
  const yCoords = region.map((p) => p.y * canvas.height);

  const x = Math.min(...xCoords);
  const y = Math.min(...yCoords);
  const width = Math.max(...xCoords) - x;
  const height = Math.max(...yCoords) - y;

  return [x, y, width, height];
}

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width:  1080,
  height:1920,
});

camera.start();
