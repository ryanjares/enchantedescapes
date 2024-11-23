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

document.getElementById("bucketFill").addEventListener("click", () => {
  currentTool = "bucket";
});

document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
});

// Update settings for color and line width
document.getElementById("colorPicker").addEventListener("input", (e) => {
  ctx.strokeStyle = e.target.value;
});

document.getElementById("lineWidth").addEventListener("input", (e) => {
  ctx.lineWidth = e.target.value;
});

// Utility function for star drawing
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

// Bucket fill utility functions
function bucketFill(x, y, fillColor) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const targetColor = getPixelColor(x, y, data);

  if (!colorsMatch(targetColor, fillColor)) {
    floodFill(data, canvas.width, canvas.height, x, y, targetColor, fillColor);
    ctx.putImageData(imgData, 0, 0);
  }
}

function floodFill(data, width, height, x, y, targetColor, fillColor) {
  const stack = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    const pixelPos = (cy * width + cx) * 4;

    const currentColor = [
      data[pixelPos],
      data[pixelPos + 1],
      data[pixelPos + 2],
      data[pixelPos + 3],
    ];

    if (colorsMatch(currentColor, targetColor)) {
      setPixelColor(data, pixelPos, fillColor);

      if (cx > 0) stack.push([cx - 1, cy]);
      if (cx < width - 1) stack.push([cx + 1, cy]);
      if (cy > 0) stack.push([cx, cy - 1]);
      if (cy < height - 1) stack.push([cx, cy + 1]);
    }
  }
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

function getPixelColor(x, y, data) {
  const index = (y * canvas.width + x) * 4;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

// Mouse Events for Drawing
canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;

  if (currentTool === "freehand") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  } else if (currentTool === "bucket") {
    const x = Math.floor(e.offsetX);
    const y = Math.floor(e.offsetY);
    const fillColor = hexToRGBA(ctx.strokeStyle);
    bucketFill(x, y, fillColor.concat(255)); // Add alpha channel
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

const countries = [
    { name: "China", code: "CHN" },
    { name: "India", code: "IND" },
    { name: "United States", code: "USA" },
    { name: "Indonesia", code: "IDN" },
    { name: "Pakistan", code: "PAK" },
    { name: "Nigeria", code: "NGA" },
    { name: "Brazil", code: "BRA" },
    { name: "Bangladesh", code: "BGD" },
    { name: "Russia", code: "RUS" },
    { name: "Mexico", code: "MEX" },
    { name: "Japan", code: "JPN" },
    { name: "Ethiopia", code: "ETH" },
    { name: "Philippines", code: "PHL" },
    { name: "Egypt", code: "EGY" },
    { name: "Vietnam", code: "VNM" },
    { name: "DR Congo", code: "COD" },
    { name: "Turkey", code: "TUR" },
    { name: "Iran", code: "IRN" },
    { name: "Germany", code: "DEU" },
    { name: "Thailand", code: "THA" }
  ];
  
  // Wheel canvas and context
const wheelCanvas = document.getElementById("wheelCanvas");
const wheelCtx = wheelCanvas.getContext("2d");

// Spin button and result display
const spinButton = document.getElementById("spinWheel");
const selectedCountryText = document.getElementById("selectedCountry");

// Wheel state
let currentAngle = 0;
let isSpinning = false;

// Predefined colors for slices
const sliceColors = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
  "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
];
function drawWheel() {
    const numSlices = countries.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
  
    for (let i = 0; i < numSlices; i++) {
      // Draw slice
      wheelCtx.beginPath();
      wheelCtx.moveTo(200, 200); // Center of the wheel
      wheelCtx.arc(200, 200, 200, i * sliceAngle, (i + 1) * sliceAngle);
      wheelCtx.closePath();
  
      // Fill slice with color
      wheelCtx.fillStyle = sliceColors[i % sliceColors.length];
      wheelCtx.fill();
      wheelCtx.strokeStyle = "#ffffff";
      wheelCtx.lineWidth = 2;
      wheelCtx.stroke();
  
      // Add text to slice
      wheelCtx.save();
      wheelCtx.translate(200, 200);
      wheelCtx.rotate(i * sliceAngle + sliceAngle / 2);
      wheelCtx.textAlign = "center";
      wheelCtx.fillStyle = "#ffffff";
      wheelCtx.font = "bold 14px Arial";
      wheelCtx.fillText(countries[i].code, 120, 5);
      wheelCtx.restore();
    }
  }
  function spinWheel() {
    if (isSpinning) return; // Prevent multiple spins
    isSpinning = true;
  
    const numSlices = countries.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
  
    const spins = Math.floor(Math.random() * 3) + 5; // Random number of full spins
    const stopAngle = Math.random() * 2 * Math.PI; // Random stopping position
    const finalAngle = spins * 2 * Math.PI + stopAngle;
  
    let currentSpinAngle = currentAngle;
    const spinSpeed = 20; // Speed of the spin
  
    function animateSpin() {
      currentSpinAngle += 0.1; // Increment spin angle
      currentAngle = currentSpinAngle % (2 * Math.PI); // Keep within bounds
  
      // Clear and redraw the wheel
      wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
      wheelCtx.save();
      wheelCtx.translate(200, 200);
      wheelCtx.rotate(currentAngle);
      wheelCtx.translate(-200, -200);
      drawWheel();
      wheelCtx.restore();
  
      if (currentSpinAngle < finalAngle) {
        requestAnimationFrame(animateSpin);
      } else {
        // Determine selected country
        const selectedSliceIndex = Math.floor(
          ((2 * Math.PI) - (currentAngle % (2 * Math.PI))) / sliceAngle
        ) % numSlices;
  
        const selectedCountry = countries[selectedSliceIndex].name;
        selectedCountryText.textContent = `Selected Country: ${selectedCo
  // Initialize the wheel
drawWheel();
spinButton.addEventListener("click", spinWheel);
