// Canvas setup
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

// State variables
let isDrawing = false;
let currentTool = "freehand";
let startX = 0;
let startY = 0;

// Set default drawing settings
ctx.strokeStyle = "#000000";
ctx.lineWidth = 5;

// Event Listeners for Tools
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

document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
});

// Event Listeners for Settings
document.getElementById("colorPicker").addEventListener("input", (e) => {
  ctx.strokeStyle = e.target.value;
});

document.getElementById("lineWidth").addEventListener("input", (e) => {
  ctx.lineWidth = e.target.value;
});

// Utility Function for Star Drawing
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

// Mouse Events for Drawing
canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;

  if (currentTool === "freehand") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const endX = e.offsetX;
  const endY = e.offsetY;

  // Clear the preview canvas for live updates
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  if (currentTool === "rectangle") {
    const width = endX - startX;
    const height = endY - startY;

    previewCtx.strokeStyle = ctx.strokeStyle;
    previewCtx.lineWidth = ctx.lineWidth;
    previewCtx.strokeRect(startX, startY, width, height);
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
  if (!isDrawing) return;
  isDrawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  // Clear preview canvas
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  if (currentTool === "rectangle") {
    const width = endX - startX;
    const height = endY - startY;
    ctx.strokeRect(startX, startY, width, height);
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

// Fix Bucket Tool (To Be Added)
function bucketFill(x, y, fillColor) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
  
    const targetColor = getPixelColor(x, y, data);
    const queue = [[x, y]];
  
    function matchColor(pixel) {
      return (
        pixel[0] === targetColor[0] &&
        pixel[1] === targetColor[1] &&
        pixel[2] === targetColor[2] &&
        pixel[3] === targetColor[3]
      );
    }
  
    while (queue.length) {
      const [cx, cy] = queue.pop();
      const pixelPos = (cy * canvas.width + cx) * 4;
  
      if (matchColor([data[pixelPos], data[pixelPos + 1], data[pixelPos + 2], data[pixelPos + 3]])) {
        data[pixelPos] = fillColor[0];
        data[pixelPos + 1] = fillColor[1];
        data[pixelPos + 2] = fillColor[2];
        data[pixelPos + 3] = fillColor[3];
  
        if (cx > 0) queue.push([cx - 1, cy]);
        if (cx < canvas.width - 1) queue.push([cx + 1, cy]);
        if (cy > 0) queue.push([cx, cy - 1]);
        if (cy < canvas.height - 1) queue.push([cx, cy + 1]);
      }
    }
  
    ctx.putImageData(imgData, 0, 0);
  }
  
  function getPixelColor(x, y, data) {
    const index = (y * canvas.width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
  }
  
  document.getElementById("bucketFill").addEventListener("click", () => {
    currentTool = "bucket";
  });
  
  canvas.addEventListener("mousedown", (e) => {
    if (currentTool === "bucket") {
      const x = Math.floor(e.offsetX);
      const y = Math.floor(e.offsetY);
      const fillColor = ctx.strokeStyle.match(/\d+/g).map(Number);
      bucketFill(x, y, fillColor.concat(255)); // Add alpha channel
    }
  });
  