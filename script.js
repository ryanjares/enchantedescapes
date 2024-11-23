const canvas = document.getElementById("flagCanvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let startX = 0;
let startY = 0;

// Set default drawing settings
ctx.strokeStyle = "black"; // Default color
ctx.lineWidth = 5; // Default thickness

// Start drawing when the mouse is pressed
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

// Draw while the mouse is moving
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    startX = e.offsetX;
    startY = e.offsetY;
  }
});

// Stop drawing when the mouse is released
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

// Stop drawing if the mouse leaves the canvas
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});
// Clear the canvas
document.getElementById("clearCanvas").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
// Change stroke color
document.getElementById("colorPicker").addEventListener("input", (e) => {
    ctx.strokeStyle = e.target.value;
  });
  let currentTool = "freehand";
  document.getElementById("drawRectangle").addEventListener("click", () => {
    currentTool = "rectangle";
  });
  
  document.getElementById("drawCircle").addEventListener("click", () => {
    currentTool = "circle";
  });
  
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
  });
  
  canvas.addEventListener("mouseup", (e) => {
    isDrawing = false;
    const endX = e.offsetX;
    const endY = e.offsetY;
  
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
  document.getElementById("lineWidth").addEventListener("input", (e) => {
    ctx.lineWidth = e.target.value;
  });
  // Update the stroke color dynamically
document.getElementById("colorPicker").addEventListener("input", (e) => {
    const selectedColor = e.target.value;
    ctx.strokeStyle = selectedColor;
  });
  