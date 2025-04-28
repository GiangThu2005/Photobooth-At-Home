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

// Khi bấm capture
function startAutoCapture() {
  const count = parseInt(countdownSelect.value);

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

          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          // Final canvas chuẩn 4:3
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = 577;
          finalCanvas.height = 434;
          const finalCtx = finalCanvas.getContext('2d');

          // Tính vùng crop để lấy đúng 4:3
          let cropWidth, cropHeight, cropX, cropY;
          const targetRatio = 4 / 3;

          const videoRatio = videoWidth / videoHeight;

          if (videoRatio > targetRatio) {
            // Video rộng hơn 4:3 ➔ crop chiều ngang
            cropHeight = videoHeight;
            cropWidth = videoHeight * targetRatio;
            cropX = (videoWidth - cropWidth) / 2;
            cropY = 0;
          } else {
            // Video hẹp hơn 4:3 ➔ crop chiều dọc
            cropWidth = videoWidth;
            cropHeight = videoWidth / targetRatio;
            cropX = 0;
            cropY = (videoHeight - cropHeight) / 2;
          }

          // Vẽ đúng vùng crop lên canvas 4:3
          finalCtx.translate(finalCanvas.width, 0); // Lật ngang như gương
          finalCtx.scale(-1, 1);
          finalCtx.drawImage(
            video,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, finalCanvas.width, finalCanvas.height
          );

          // Lưu final canvas vào mảng
          capturedImages.push(finalCanvas);

          // Preview
          const previewCanvas = document.getElementById(`preview${capturedImages.length}`);
          if (previewCanvas) {
            previewCanvas.classList.remove("hidden");
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.drawImage(finalCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
          }

          if (capturedImages.length < 3) {
            countdownAndCapture();
          } else {
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
