// 📸 Lấy canvas và context để vẽ
const canvas = document.getElementById("editCanvas");
const ctx = canvas.getContext("2d");

// 🎨 Các biến quản lý giao diện
let currentFrame = new Image();             // Khung nền (có thể thay đổi)
let currentStickers = [];                   // Sticker đang dán
let backgroundColor = "white";              // Màu nền mặc định
let captured = JSON.parse(localStorage.getItem("capturedPhotos")) || []; // Ảnh đã chụp
let originalImages = [...captured];          // Bản sao dữ liệu gốc
const photoPositions = [121, 616, 1116];     // Vị trí 3 ảnh trên canvas
let photoCanvases = [];                      // Canvas con cho từng ảnh
let photoStates = [];                        // Lưu trạng thái gốc của ảnh

// 🚀 Khởi tạo canvas từng ảnh
function initPhotoCanvases(callback) {
  photoCanvases = [];
  photoStates = [];
  let loaded = 0;

  for (let i = 0; i < captured.length; i++) {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 577;
      c.height = 434;
      const context = c.getContext("2d");
      context.drawImage(img, 0, 0, 577, 434);
      photoCanvases[i] = c;
      photoStates[i] = {
        originalData: context.getImageData(0, 0, 577, 434)
      };
      loaded++;
      if (loaded === captured.length && callback) callback();
    };
    img.src = captured[i];
  }
}

// ✏️ Vẽ toàn bộ canvas
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ frame nền nếu có
  if (currentFrame.complete && currentFrame.src) {
    ctx.drawImage(currentFrame, 0, 0, 700, 2000);
  }

  // Vẽ từng ảnh
  for (let i = 0; i < photoCanvases.length; i++) {
    if (photoCanvases[i]) {
      ctx.drawImage(photoCanvases[i], 70, photoPositions[i], 577, 434);
    }
  }

  // Vẽ sticker (nếu có)
  currentStickers.forEach(stk => {
    ctx.drawImage(stk.img, stk.x, stk.y, stk.w, stk.h);
  });
}

// 🎨 Đổi màu nền
function changeBackground(color) {
  backgroundColor = color;
  currentFrame.src = "";
  drawAll();
}

// 🎨 Đổi frame nền
function changeFrame(src) {
  currentFrame.src = src;
  currentFrame.onload = drawAll;
}

// 🖼️ Thêm sticker
function addSticker(src) {
  const img = new Image();
  img.onload = () => {
    currentStickers = [{ img, x: 0, y: 0, w: 700, h: 2000 }];
    drawAll();
  };
  img.src = src;
}

// 🔄 Reset filter về ảnh gốc cho ảnh đang chọn
function resetFilterOfSelected() {
  const selectedIndex = parseInt(document.getElementById("photoSelect").value);
  const ctxPhoto = photoCanvases[selectedIndex].getContext("2d");
  ctxPhoto.putImageData(photoStates[selectedIndex].originalData, 0, 0);
  drawAll();
}

// 🎞️ Filter trắng đen
function applyGrayscaleToSelected() {
  const selectedIndex = parseInt(document.getElementById("photoSelect").value);
  resetFilterOfSelected();
  const ctxPhoto = photoCanvases[selectedIndex].getContext("2d");
  const imageData = ctxPhoto.getImageData(0, 0, 577, 434);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
    imageData.data[i] = avg;
    imageData.data[i+1] = avg;
    imageData.data[i+2] = avg;
  }
  ctxPhoto.putImageData(imageData, 0, 0);
  drawAll();
}

// 💡 Filter tăng sáng
function adjustBrightnessToSelected(value) {
  const selectedIndex = parseInt(document.getElementById("photoSelect").value);
  resetFilterOfSelected();
  const ctxPhoto = photoCanvases[selectedIndex].getContext("2d");
  const imageData = ctxPhoto.getImageData(0, 0, 577, 434);

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] += value;
    imageData.data[i+1] += value;
    imageData.data[i+2] += value;
  }
  ctxPhoto.putImageData(imageData, 0, 0);
  drawAll();
}

// 🌑 Filter làm tối
function applyDarkenToSelected() {
  const selectedIndex = parseInt(document.getElementById("photoSelect").value);
  resetFilterOfSelected();
  const ctxPhoto = photoCanvases[selectedIndex].getContext("2d");
  const imageData = ctxPhoto.getImageData(0, 0, 577, 434);

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] -= 30;
    imageData.data[i+1] -= 30;
    imageData.data[i+2] -= 30;
  }
  ctxPhoto.putImageData(imageData, 0, 0);
  drawAll();
}

// ❄️ Filter tông lạnh
function applyCoolToneToSelected() {
  const selectedIndex = parseInt(document.getElementById("photoSelect").value);
  resetFilterOfSelected();
  const ctxPhoto = photoCanvases[selectedIndex].getContext("2d");
  const imageData = ctxPhoto.getImageData(0, 0, 577, 434);

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] -= 20;     // Giảm đỏ
    imageData.data[i+2] += 20;   // Tăng xanh
  }
  ctxPhoto.putImageData(imageData, 0, 0);
  drawAll();
}

// 🔥 Filter tông ấm
function applyWarmToneToSelected() {
  const selectedIndex = parseInt(document.getElementById("photoSelect").value);
  resetFilterOfSelected();
  const ctxPhoto = photoCanvases[selectedIndex].getContext("2d");
  const imageData = ctxPhoto.getImageData(0, 0, 577, 434);

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] += 20;     // Tăng đỏ
    imageData.data[i+2] -= 20;   // Giảm xanh
  }
  ctxPhoto.putImageData(imageData, 0, 0);
  drawAll();
}

// 🧹 Reset toàn bộ canvas về ban đầu
function resetCanvas() {
  captured = [...originalImages];
  currentFrame.src = "";
  currentStickers = [];
  backgroundColor = "white";
  initPhotoCanvases(drawAll);
}

// 💾 Tải canvas về dưới dạng ảnh PNG
function downloadImage() {
  const link = document.createElement("a");
  link.download = "edited_photobooth.png";
  link.href = canvas.toDataURL();
  link.click();
}

// 🚀 Khi trang tải xong, khởi tạo canvas
window.onload = () => {
  initPhotoCanvases(drawAll);
};
