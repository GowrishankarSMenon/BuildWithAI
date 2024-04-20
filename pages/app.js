const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let leftShoulder;
let leftElbow;
let leftWrist;
let elobAngle;
let poses;
let Angle;
let backAngle;
let reps = 0;
let highLightBack = false;
let backWarningGiven = false;
let upPosition = true;
let downPostion = false;
const edges = [
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10],
  [5, 6],
  [5, 11],
  [6, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];

async function start(image) {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
  
    const videoElement = await Onload();
    flipHorizontal = true;
  
    // Scale the image. The smaller the faster
    const imageScaleFactor = 0.75;
  
    // Stride, the larger, the smaller the output, the faster
    const outputStride = 32;
    let pose = [];
    let minPoseConfidence;
    let minPartConfidence;
  
    async function AgainStart() {
      poses = await detector.estimatePoses(
        videoElement,
        imageScaleFactor,
        flipHorizontal,
        outputStride
      );
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw poses on canvas
      DrawPose(poses);
  
      requestAnimationFrame(AgainStart);
    }
    AgainStart();
  }