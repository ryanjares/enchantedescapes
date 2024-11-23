const canvas = document.getElementById("flagCanvas");
const ctx = canvas.getContext("2d");

// State variables
let isDrawing = false;
let currentTool = "freehand";
let startX = 0;
let startY = 0;
let previewCanvas = document.createElement("canvas");
let previewCtx = previewCanvas.getContext("2d");

// Set up preview canvas (overlays the main canvas)
previewCanvas.width = canvas.width;
previewCanvas.height = canvas.height;
previewCanvas.style.position = "absolute";
previewCanvas.style.left = canvas.offsetLeft + "px";
previewCanvas.style.top = canvas.offsetTop + "px";
previewCanvas.style.pointerEvents = "none";
document.body.appendChild(previewCanvas);

// Default settings
ctx.strokeStyle = "#000000"; // Default color
ctx.lineWidth = 5; // Default line thickness

// Tool selection buttons
document.getElementById("drawFreehand").addEventListener("click", () => {
  currentTool = "freehand";
});

document.getElementById("drawRectangle").addEventListener("click", () => {
  currentTool = "rectangle";
});

document.getElementById("drawCircle").addEventListener("click", () => {
  currentTool = "circle";
});

// Handle canvas drawing events
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (currentTool === "freehand") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const endX = e.offsetX;
  const endY = e.offsetY;

  // Clear preview canvas
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  if (currentTool === "freehand") {
    ctx.lineTo(endX, endY);
    ctx.stroke();
    startX = endX;
    startY = endY;
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
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!isDrawing) return;
  isDrawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  // Clear preview layer on mouseup
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
  }
});

// Stop drawing if the mouse leaves the canvas
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
});

// Clear canvas button
document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
});

// Update stroke color
document.getElementById("colorPicker").addEventListener("input", (e) => {
  ctx.strokeStyle = e.target.value;
});

// Update line thickness
document.getElementById("lineWidth").addEventListener("input", (e) => {
  ctx.lineWidth = e.target.value;
});
// List of top 20 most populous countries
const countries = [
    "China", "India", "United States", "Indonesia", "Pakistan", "Nigeria",
    "Brazil", "Bangladesh", "Russia", "Mexico", "Japan", "Ethiopia",
    "Philippines", "Egypt", "Vietnam", "DR Congo", "Turkey", "Iran",
    "Germany", "Thailand"
  ];
  
  const wheelCanvas = document.getElementById("wheelCanvas");
  const wheelCtx = wheelCanvas.getContext("2d");
  const spinButton = document.getElementById("spinWheel");
  const selectedCountryText = document.getElementById("selectedCountry");
  
  let wheelAngle = 0;
  let spinTimeout = null;
  
  // Draw the wheel
  function drawWheel() {
    const numSlices = countries.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
  
    for (let i = 0; i < numSlices; i++) {
      // Set slice color
      wheelCtx.beginPath();
      wheelCtx.moveTo(200, 200); // Center of the canvas
      wheelCtx.arc(200, 200, 200, i * sliceAngle, (i + 1) * sliceAngle);
      wheelCtx.closePath();
      wheelCtx.fillStyle = i % 2 === 0 ? "#f4a261" : "#2a9d8f";
      wheelCtx.fill();
      wheelCtx.stroke();
  
      // Add country names
      wheelCtx.save();
      wheelCtx.translate(200, 200);
      wheelCtx.rotate(i * sliceAngle + sliceAngle / 2);
      wheelCtx.textAlign = "center";
      wheelCtx.fillStyle = "#ffffff";
      wheelCtx.font = "14px Arial";
      wheelCtx.fillText(countries[i], 120, 5);
      wheelCtx.restore();
    }
  }
  
  // Spin the wheel
  function spinWheel() {
    let spins = Math.floor(Math.random() * 5) + 3; // Spin at least 3 times
    let endAngle = Math.random() * 2 * Math.PI; // Random stopping point
    let finalAngle = (spins * 2 * Math.PI) + endAngle;
  
    let currentAngle = 0;
    const spinSpeed = 20; // Adjust spin speed
  
    function animateSpin() {
      currentAngle += 0.1; // Increment spin speed
      wheelAngle = (currentAngle % (2 * Math.PI));
      wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
      wheelCtx.save();
      wheelCtx.translate(200, 200);
      wheelCtx.rotate(wheelAngle);
      wheelCtx.translate(-200, -200);
      drawWheel();
      wheelCtx.restore();
  
      if (currentAngle < finalAngle) {
        spinTimeout = requestAnimationFrame(animateSpin);
      } else {
        // Select a country
        let selectedSlice = Math.floor(((2 * Math.PI) - (wheelAngle % (2 * Math.PI))) / ((2 * Math.PI) / countries.length));
        if (selectedSlice === countries.length) selectedSlice = 0; // Handle edge case
        selectedCountryText.innerText = `Selected Country: ${countries[selectedSlice]}`;
      }
    }
  
    animateSpin();
  }
  
  // Initialize the wheel
  drawWheel();
  spinButton.addEventListener("click", spinWheel);
  function drawWheel() {
    const numSlices = countries.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
  
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height); // Clear canvas
    for (let i = 0; i < numSlices; i++) {
      // Draw each slice
      wheelCtx.beginPath();
      wheelCtx.moveTo(200, 200); // Center of the wheel
      wheelCtx.arc(200, 200, 200, i * sliceAngle, (i + 1) * sliceAngle);
      wheelCtx.closePath();
  
      // Alternate colors
      wheelCtx.fillStyle = i % 2 === 0 ? "#f4a261" : "#2a9d8f";
      wheelCtx.fill();
      wheelCtx.stroke();
  
      // Add country names
      wheelCtx.save();
      wheelCtx.translate(200, 200);
      wheelCtx.rotate(i * sliceAngle + sliceAngle / 2);
      wheelCtx.textAlign = "center";
      wheelCtx.fillStyle = "#ffffff";
      wheelCtx.font = "14px Arial";
      wheelCtx.fillText(countries[i], 120, 5); // Adjust text position
      wheelCtx.restore();
    }
  }
  document.getElementById("drawStar").addEventListener("click", () => {
    currentTool = "star";
  });
  
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
  
  canvas.addEventListener("mouseup", (e) => {
    if (!isDrawing) return;
    isDrawing = false;
  
    const endX = e.offsetX;
    const endY = e.offsetY;
  
    if (currentTool === "star") {
      const outerRadius = 40;
      const innerRadius = 20;
      drawStar(ctx, endX, endY, 5, outerRadius, innerRadius);
    }
  });
  document.getElementById("bucketFill").addEventListener("click", () => {
    currentTool = "bucket";
  });
  
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
  
  canvas.addEventListener("mousedown", (e) => {
    if (currentTool === "bucket") {
      const x = Math.floor(e.offsetX);
      const y = Math.floor(e.offsetY);
      const fillColor = hexToRGBA(ctx.strokeStyle);
      bucketFill(x, y, fillColor);
    }
  });
  
  function hexToRGBA(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255,
      255,
    ];
  }
      