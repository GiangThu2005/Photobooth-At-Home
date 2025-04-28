// Lấy các phần tử HTML cần dùng
const video = document.getElementById('video');           // video hiển thị webcam
const capture = document.getElementById('capture');       // nút bắt đầu chụp
const countdownOverlay = document.getElementById("countdownOverlay"); // overlay hiện số đếm
const countdownSelect = document.getElementById("countdown");         // dropdown chọn thời gian đếm

// Mảng lưu các canvas ảnh đã chụp
const capturedImages = [];

// Bật webcam và hiển thị trên video
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Không thể truy cập webcam:", err);
  });

// Bắt đầu chụp ảnh tự động sau khi nhấn nút
function startAutoCapture() {
  const count = parseInt(countdownSelect.value); // lấy thời gian đếm ngược từ dropdown

  function countdownAndCapture() {
    if (capturedImages.length >= 3) return;

    let currentCount = count;
    countdownOverlay.classList.remove("hidden");
    countdownOverlay.textContent = currentCount;

    const interval = setInterval(() => {
      currentCount--;

      if (currentCount >= 0) {
        countdownOverlay.textContent = currentCount;
      }

      if (currentCount === 0) {
        clearInterval(interval);

        setTimeout(() => {
          countdownOverlay.classList.add("hidden");

          // Lấy kích thước gốc của video
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          // Tạo canvas tạm cùng tỷ lệ video
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = videoWidth;
          tempCanvas.height = videoHeight;
          const tempCtx = tempCanvas.getContext('2d');

          // Lật ngang
          tempCtx.translate(videoWidth, 0);
          tempCtx.scale(-1, 1);

          tempCtx.drawImage(video, 0, 0, videoWidth, videoHeight);

          // 🖼️ Tiếp theo: Resize canvas về tỷ lệ 4:3 chuẩn 577x434
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = 577;
          finalCanvas.height = 434;
          const finalCtx = finalCanvas.getContext('2d');

          // Tính tỉ lệ scale
          const scale = Math.min(videoWidth / 577, videoHeight / 434);

          // Cắt vùng giữa video cho đẹp
          const cropWidth = 577 * scale;
          const cropHeight = 434 * scale;
          const cropX = (videoWidth - cropWidth) / 2;
          const cropY = (videoHeight - cropHeight) / 2;

          // Vẽ phần crop lên final canvas
          finalCtx.drawImage(
            tempCanvas,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, 577, 434
          );

          // Lưu final canvas vào mảng
          capturedImages.push(finalCanvas);

          // Hiển thị preview
          const previewCanvas = document.getElementById(`preview${capturedImages.length}`);
          if (previewCanvas) {
            previewCanvas.classList.remove("hidden");
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.drawImage(finalCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
          }

          // Nếu chưa đủ 3 ảnh, tiếp tục
          if (capturedImages.length < 3) {
            countdownAndCapture();
          } else {
            // Đủ 3 ảnh -> lưu và chuyển trang
            const imageData = capturedImages.map(canvas => canvas.toDataURL());
            localStorage.setItem("capturedPhotos", JSON.stringify(imageData));
            window.location.href = "edit.html";
          }
        }, 500);
      }
    }, 1000);
  }

  countdownAndCapture();
}

// Khi click nút, bắt đầu quy trình chụp
capture.addEventListener("click", startAutoCapture);
