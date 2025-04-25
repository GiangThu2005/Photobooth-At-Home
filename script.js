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
    // Nếu đã chụp đủ 3 ảnh thì không làm gì nữa
    if (capturedImages.length >= 3) return;

    let currentCount = count;
    countdownOverlay.classList.remove("hidden");
    countdownOverlay.textContent = currentCount;

    // Mỗi 1 giây giảm số đếm
    const interval = setInterval(() => {
      currentCount--;

      if (currentCount >= 0) {
        countdownOverlay.textContent = currentCount;
      }

      // Khi countdown = 0 thì chụp ảnh
      if (currentCount === 0) {
        clearInterval(interval);

        setTimeout(() => {
          countdownOverlay.classList.add("hidden");

          // Tạo canvas tạm để lưu ảnh chụp
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 577;
          tempCanvas.height = 434;
          const tempCtx = tempCanvas.getContext('2d');

          // Lật ảnh ngang để giống gương
          tempCtx.translate(tempCanvas.width, 0);
          tempCtx.scale(-1, 1);
          tempCtx.drawImage(video, 0, 0, 577, 434);

          // Lưu canvas vào mảng
          capturedImages.push(tempCanvas);

          // Hiển thị preview ảnh tương ứng
          const previewCanvas = document.getElementById(`preview${capturedImages.length}`);
          if (previewCanvas) {
            previewCanvas.classList.remove("hidden");
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.drawImage(tempCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
          }

          // Tiếp tục chụp nếu chưa đủ 3 ảnh
          if (capturedImages.length < 3) {
            countdownAndCapture();
          } else {
            // Khi đủ 3 ảnh -> chuyển sang trang edit + lưu ảnh vào localStorage
            const imageData = capturedImages.map(canvas => canvas.toDataURL());
            localStorage.setItem("capturedPhotos", JSON.stringify(imageData));
            window.location.href = "edit.html";
          }
        }, 500); // delay 0.5s để hiện số 0 trước khi ẩn
      }
    }, 1000); // mỗi giây 1 lần
  }

  countdownAndCapture();
}

// Khi click nút, bắt đầu quy trình chụp
capture.addEventListener("click", startAutoCapture);
