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
    