// edit.js
const canvas = document.getElementById("editCanvas");
const ctx = canvas.getContext("2d");
let currentFrame = new Image();
let currentStickers = [];
let backgroundColor = "white"; // mặc định màu nền trắng

// Lấy ảnh từ localStorage hoặc giả lập
let captured = JSON.parse(localStorage.getItem("capturedPhotos")) || [];
if (captured.length === 0) {
  for (let i = 0; i < 3; i++) {
    const temp = document.createElement("canvas");
    temp.width = 577;
    temp.height = 434;
    const tctx = temp.getContext("2d");
    tctx.fillStyle = ["red", "green", "blue"][i];
    tctx.fillRect(0, 0, 577, 434);
    captured.push(temp.toDataURL());
  }
}

function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Vẽ nền màu (frame màu)
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ khung PNG nếu có
  if (currentFrame.complete && currentFrame.src) {
    ctx.drawImage(currentFrame, 0, 0, 700, 2000);
  }
  
  // Vẽ ảnh đã chụp
  const positions = [121, 616, 1116];
  let loadedCount = 0;

  const drawCapturedPhotos = () => {
    for (let i = 0; i < captured.length; i++) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 70, positions[i], 577, 434);
        loadedCount++;
        if (loadedCount === captured.length) {
          drawStickersAndFrame();
        }
      };
      img.src = captured[i];
    }
  };

  const drawStickersAndFrame = () => {
    // Vẽ sticker
    currentStickers.forEach(stk => {
      ctx.drawImage(stk.img, stk.x, stk.y, stk.w, stk.h);
    });

  };

  drawCapturedPhotos();
}

function changeBackground(color) {
  backgroundColor = color;
  currentFrame.src = ""; // bỏ PNG nếu đang chọn
  drawAll();
}

function changeFrame(src) {
  currentFrame.src = src;
  currentFrame.onload = drawAll;
}

function addSticker(src) {
  const img = new Image();
  img.onload = () => {
    currentStickers = [{ img, x: 0, y: 0, w: 700, h: 2000 }];
    drawAll();
  };
  img.src = src;
}

function adjustBrightness(value) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] += value;
    imageData.data[i + 1] += value;
    imageData.data[i + 2] += value;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyGrayscale() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = avg;
    imageData.data[i + 1] = avg;
    imageData.data[i + 2] = avg;
  }
  ctx.putImageData(imageData, 0, 0);
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "edited_photobooth.png";
  link.href = canvas.toDataURL();
  link.click();
}

window.onload = drawAll;
