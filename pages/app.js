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
// Draw poses on canvas
function DrawPose(poses) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  poses.forEach((pose) => {
    const keypoints = pose.keypoints;

    if (keypoints) {
      keypoints.forEach((keypoint) => {
        if (keypoint) {
          if (keypoint.score > 0.3) {
            const x = keypoint.x;
            const y = keypoint.y;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
          }

          AngleCalculate();
          updateBackAngle();
          inUpPosition();
          inDownPostion();
        }
      });

      edges.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        if (kp1 && kp2 && kp1.score > 0.2 && kp2.score > 0.2) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  });
}

async function CameraSetup() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("camera of your browser is not accessible");
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}
async function Onload() {
  const video = await CameraSetup();
  video.play();
  return video;
}
async function main() {
  await start();
}
main().catch(console.error);

function AngleCalculate() {
  if (poses.length > 0) {
    leftShoulder = poses[0].keypoints[5];
    leftWrist = poses[0].keypoints[9];
    leftElbow = poses[0].keypoints[7];

    if (
      leftElbow.score > 0.3 &&
      leftWrist.score > 0.3 &&
      leftShoulder.score > 0.3
    ) {
      Angle =
        (Math.atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x) -
          Math.atan2(
            leftShoulder.y - leftElbow.y,
            leftShoulder.x - leftElbow.x
          )) *
        (180 / Math.PI);

      elobAngle = Angle < 0 ? Angle + 360 : Angle;

      // console.log("Pushup Angle:", elobAngle);
    } else {
      // console.log("Scores below threshold.");
    }
  } else {
    console.log("No poses detected.");
  }
}

function inUpPosition() {
  if (elobAngle > 170 && elobAngle < 190) {
    if (downPostion == true) {
      reps += 1;
      console.log(`push completed :${reps}`);
      console.log(elobAngle);
    }
    upPosition = true;
    downPostion = false;
  }
}

function inDownPostion() {
  var elbowAboveNose = false;
  if (poses[0].keypoints[0].y > poses[0].keypoints[7].y) {
    elbowAboveNose = true;
  }

  if (
    highLightBack == false &&
    elbowAboveNose &&
    elobAngle > 70 &&
    elobAngle < 100
  ) {
    if (upPosition == true) {
      console.log(`push at down :${reps}`);
      console.log(elobAngle);
    }
    upPosition = false;
    downPostion = true;
  }
}

function updateBackAngle() {
  var leftShoulder = poses[0].keypoints[5];
  var leftHip = poses[0].keypoints[11];
  var leftKnee = poses[0].keypoints[13];

  Angle =
    (Math.atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x) -
      Math.atan2(leftShoulder.y - leftHip.y, leftShoulder.x - leftHip.x)) *
    (180 / Math.PI);
    Angle = Angle % 180;
  if (leftShoulder.score > 0.3 && leftHip.score > 0.3 && leftKnee.score > 0.3) {
    backAngle = Angle;
  }
  if (backAngle < 20 || backAngle > 160) {
    highLightBack = false;
  } else {
    highLightBack = true;
  }
}