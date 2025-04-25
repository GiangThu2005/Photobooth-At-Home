// Lấy canvas và context để vẽ ảnh
const canvas = document.getElementById("editCanvas");
const ctx = canvas.getContext("2d");

// Biến lưu khung PNG nếu có
let currentFrame = new Image();

// Mảng chứa sticker hiện tại
let currentStickers = [];

// Màu nền mặc định của canvas
let backgroundColor = "white";

// Lấy danh sách ảnh đã chụp từ localStorage (do script.js lưu)
let captured = JSON.parse(localStorage.getItem("capturedPhotos")) || [];

// Hàm vẽ toàn bộ canvas: nền, ảnh, sticker, khung
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // xoá toàn bộ canvas

  // Vẽ nền màu hoặc trắng
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ khung PNG nếu có
  if (currentFrame.complete && currentFrame.src) {
    ctx.drawImage(currentFrame, 0, 0, 700, 2000);
  }

  // Vẽ ảnh chụp vào 3 vị trí cố định
  const positions = [121, 616, 1116];
  let loadedCount = 0;

  const drawCapturedPhotos = () => {
    for (let i = 0; i < captured.length; i++) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 70, positions[i], 577, 434);
        loadedCount++;
        if (loadedCount === captured.length) {
          drawStickers(); // khi vẽ đủ ảnh thì vẽ tiếp sticker
        }
      };
      img.src = captured[i];
    }
  };

  const drawStickers = () => {
    currentStickers.forEach(stk => {
      ctx.drawImage(stk.img, stk.x, stk.y, stk.w, stk.h);
    });
  };

  drawCapturedPhotos();
}

// Đổi màu nền, bỏ khung PNG nếu có
function changeBackground(color) {
  backgroundColor = color;
  currentFrame.src = ""; // loại bỏ frame PNG đang hiển thị
  drawAll();
}

// Đổi khung PNG mới
function changeFrame(src) {
  currentFrame.src = src;
  currentFrame.onload = drawAll; // vẽ lại sau khi tải xong ảnh
}

// Thêm sticker vào canvas (dạng full khung)
function addSticker(src) {
  const img = new Image();
  img.onload = () => {
    currentStickers = [{ img, x: 0, y: 0, w: 700, h: 2000 }]; // chỉ cho 1 sticker tại 1 thời điểm
    drawAll();
  };
  img.src = src;
}

// Tăng độ sáng toàn bộ ảnh trên canvas
function adjustBrightness(value) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] += value;     // Red
    imageData.data[i + 1] += value; // Green
    imageData.data[i + 2] += value; // Blue
  }
  ctx.putImageData(imageData, 0, 0);
}

// Chuyển toàn bộ ảnh sang trắng đen
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

// Tải canvas hiện tại thành ảnh PNG
function downloadImage() {
  const link = document.createElement("a");
  link.download = "edited_photobooth.png";
  link.href = canvas.toDataURL();
  link.click();
}

// Vẽ khi trang load xong
window.onload = drawAll;
