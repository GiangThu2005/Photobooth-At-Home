const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const downloadBtn = document.getElementById('downloadBtn');
const finalCanvas = document.getElementById('finalCanvas');
const finalCtx = finalCanvas.getContext('2d');
const capturedImages = [];

const countdownOverlay = document.getElementById("countdownOverlay");
const countdownSelect = document.getElementById("countdown");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Không thể truy cập webcam:", err);
  });

function startAutoCapture() {
  let count = parseInt(countdownSelect.value);

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

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 577;
          tempCanvas.height = 434;
          const tempCtx = tempCanvas.getContext('2d');

          tempCtx.translate(tempCanvas.width, 0);
          tempCtx.scale(-1, 1);
          tempCtx.drawImage(video, 0, 0, 577, 434);

          capturedImages.push(tempCanvas);
          const previewCanvas = document.getElementById(`preview${capturedImages.length}`);
          if (previewCanvas) {
            previewCanvas.classList.remove("hidden"); // 👈 hiện canvas
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.drawImage(tempCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
          }
          if (capturedImages.length < 3) {
            countdownAndCapture();
          } else {
            const imageData = capturedImages.map(canvas => canvas.toDataURL());
            localStorage.setItem("capturedPhotos", JSON.stringify(imageData));
            window.location.href = "edit.html";
          }
        }, 500); // Delay để hiển thị số 0
      }
    }, 1000);
  }

  countdownAndCapture();
}

captureBtn.addEventListener("click", startAutoCapture);

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'photobooth.png';
  link.href = finalCanvas.toDataURL();
  link.click();
});