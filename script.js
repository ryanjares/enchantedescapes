// Canvas setup for the drawing tool
const canvas = document.getElementById("flagCanvas");
const ctx = canvas.getContext("2d");

// Preview canvas for live shape previews
const previewCanvas = document.createElement("canvas");
const previewCtx = previewCanvas.getContext("2d");
previewCanvas.width = canvas.width;
previewCanvas.height = canvas.height;
previewCanvas.style.position = "absolute";
previewCanvas.style.left = canvas.offsetLeft + "px";
previewCanvas.style.top = canvas.offsetTop + "px";
previewCanvas.style.pointerEvents = "none";
document.body.appendChild(previewCanvas);

// State variables for drawing tools
let isDrawing = false;
let currentTool = "freehand";
let startX = 0;
let startY = 0;

// Default drawing settings
ctx.strokeStyle = "#000000";
ctx.lineWidth = 5;

// Utility function to draw a star
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.stroke();
}

// Event listeners for tool selection
document.getElementById("drawFreehand").addEventListener("click", () => {
  currentTool = "freehand";
});

document.getElementById("drawRectangle").addEventListener("click", () => {
  currentTool = "rectangle";
});

document.getElementById("drawCircle").addEventListener("click", () => {
  currentTool = "circle";
});

document.getElementById("drawStar").addEventListener("click", () => {
  currentTool = "star";
});

document.getElementById("bucketFill").addEventListener("click", () => {
  currentTool = "bucket";
});

document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
});

// Event listeners for settings updates
document.getElementById("colorPicker").addEventListener("input", (e) => {
  ctx.strokeStyle = e.target.value;
});

document.getElementById("lineWidth").addEventListener("input", (e) => {
  ctx.lineWidth = e.target.value;
});

// Utility functions for bucket fill
function getPixelColor(x, y, data) {
  const index = (y * canvas.width + x) * 4;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function colorsMatch(color1, color2) {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  );
}

function setPixelColor(data, index, fillColor) {
  data[index] = fillColor[0];
  data[index + 1] = fillColor[1];
  data[index + 2] = fillColor[2];
  data[index + 3] = fillColor[3];
}

function bucketFill(x, y, fillColor) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const targetColor = getPixelColor(x, y, data);

  if (!colorsMatch(targetColor, fillColor)) {
    const queue = [[x, y]];

    while (queue.length > 0) {
      const [cx, cy] = queue.pop();
      const pixelPos = (cy * canvas.width + cx) * 4;

      const currentColor = [
        data[pixelPos],
        data[pixelPos + 1],
        data[pixelPos + 2],
        data[pixelPos + 3],
      ];

      if (colorsMatch(currentColor, targetColor)) {
        setPixelColor(data, pixelPos, fillColor);

        if (cx > 0) queue.push([cx - 1, cy]);
        if (cx < canvas.width - 1) queue.push([cx + 1, cy]);
        if (cy > 0) queue.push([cx, cy - 1]);
        if (cy < canvas.height - 1) queue.push([cx, cy + 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }
}

// Drawing event listeners
canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;

  if (currentTool === "freehand") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  } else if (currentTool === "bucket") {
    const fillColor = ctx.strokeStyle.match(/\d+/g).map(Number);
    bucketFill(startX, startY, fillColor.concat(255));
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const endX = e.offsetX;
  const endY = e.offsetY;

  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  if (currentTool === "freehand") {
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else if (currentTool === "rectangle") {
    previewCtx.strokeStyle = ctx.strokeStyle;
    previewCtx.lineWidth = ctx.lineWidth;
    previewCtx.strokeRect(startX, startY, endX - startX, endY - startY);
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    previewCtx.strokeStyle = ctx.strokeStyle;
    previewCtx.lineWidth = ctx.lineWidth;
    previewCtx.beginPath();
    previewCtx.arc(startX, startY, radius, 0, Math.PI * 2);
    previewCtx.stroke();
  } else if (currentTool === "star") {
    const outerRadius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const innerRadius = outerRadius / 2;
    previewCtx.strokeStyle = ctx.strokeStyle;
    previewCtx.lineWidth = ctx.lineWidth;
    drawStar(previewCtx, startX, startY, 5, outerRadius, innerRadius);
  }
});

canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  if (currentTool === "rectangle") {
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (currentTool === "star") {
    const outerRadius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const innerRadius = outerRadius / 2;
    drawStar(ctx, startX, startY, 5, outerRadius, innerRadius);
  }
});

// Country wheel setup
const countries = [
  { name: "China", code: "CHN" },
  { name: "India", code: "IND" },
  { name: "United States", code: "USA" },
  // ... Add the remaining countries
];

const wheelCanvas = document.getElementById("wheelCanvas");
const wheelCtx = wheelCanvas.getContext("2d");

function drawWheel() {
  const numSlices = countries.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  for (let i = 0; i < numSlices; i++) {
    wheelCtx.beginPath();
    wheelCtx.moveTo(200, 200);
    wheelCtx.arc(200, 200, 200, i * sliceAngle, (i + 1) * sliceAngle);
    wheelCtx.closePath();

    wheelCtx.fillStyle = sliceColors[i % sliceColors.length];
    wheelCtx.fill();
    wheelCtx.strokeStyle = "#fff";
    wheelCtx.stroke();

    wheelCtx.save();
    wheelCtx.translate(200, 200);
