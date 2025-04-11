document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const imageInput = document.getElementById('image');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrCodeContainer = document.getElementById('qr-code');
    
    let qrCode = null;
    let selectedImage = null;

    // Initially hide the download button
    downloadBtn.style.display = 'none';

    // Handle image selection
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImage = e.target.result;
                console.log('Image loaded successfully');
            };
            reader.onerror = (error) => {
                console.error('Error loading image:', error);
            };
            reader.readAsDataURL(file);
        }
    });

    // Generate QR code
    generateBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        console.log('Generating QR code for URL:', url);
        console.log('Selected image:', selectedImage ? 'Yes' : 'No');

        // Clear previous QR code
        qrCodeContainer.innerHTML = '';

        try {
            // Create new QR code instance with improved styling
            qrCode = new QRCode(qrCodeContainer, {
                text: url,
                width: 300,
                height: 300,
                colorDark: '#ADC8C0', // Mint color
                colorLight: '#FDF6F0', // Soft peach background
                correctLevel: QRCode.CorrectLevel.H,
                quietZone: 10,
                quietZoneColor: '#FDF6F0'
            });

            // If an image is selected, overlay it on the QR code
            if (selectedImage) {
                // Create a new canvas for the final result
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = 300;
                finalCanvas.height = 300;
                const finalCtx = finalCanvas.getContext('2d');

                // Wait for the QR code to be fully rendered
                const checkQRCode = setInterval(() => {
                    const qrCanvas = qrCodeContainer.querySelector('canvas');
                    if (qrCanvas) {
                        clearInterval(checkQRCode);
                        
                        // Draw the QR code on the final canvas
                        finalCtx.drawImage(qrCanvas, 0, 0);
                        
                        // Calculate the size of the image overlay (25% of QR code size)
                        const imageSize = finalCanvas.width * 0.25;
                        const imageX = (finalCanvas.width - imageSize) / 2;
                        const imageY = (finalCanvas.height - imageSize) / 2;

                        // Create a white background for the image with rounded corners
                        finalCtx.fillStyle = '#ffffff';
                        finalCtx.beginPath();
                        finalCtx.roundRect(imageX, imageY, imageSize, imageSize, 12);
                        finalCtx.fill();

                        // Draw the image with rounded corners
                        const img = new Image();
                        img.onload = () => {
                            // Create a clipping path for rounded corners
                            finalCtx.save();
                            finalCtx.beginPath();
                            finalCtx.roundRect(imageX, imageY, imageSize, imageSize, 12);
                            finalCtx.clip();
                            
                            // Draw the image
                            finalCtx.drawImage(img, imageX, imageY, imageSize, imageSize);
                            
                            // Restore the context
                            finalCtx.restore();
                            
                            // Add a subtle border
                            finalCtx.strokeStyle = '#ADC8C0';
                            finalCtx.lineWidth = 2;
                            finalCtx.beginPath();
                            finalCtx.roundRect(imageX, imageY, imageSize, imageSize, 12);
                            finalCtx.stroke();

                            // Replace the QR code canvas with our final canvas
                            qrCodeContainer.innerHTML = '';
                            qrCodeContainer.appendChild(finalCanvas);

                            // Show download button after QR code is generated
                            downloadBtn.style.display = 'block';
                        };
                        img.src = selectedImage;
                    }
                }, 100);
            } else {
                // Show download button after QR code is generated
                downloadBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Error in QR code generation:', error);
            alert('Error generating QR code. Please check the console for details.');
        }
    });

    // Download QR code
    downloadBtn.addEventListener('click', () => {
        const canvas = qrCodeContainer.querySelector('canvas');
        if (!canvas) {
            alert('Please generate a QR code first');
            return;
        }
        try {
            // Check if we're on iOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            
            if (isIOS) {
                // For iOS devices, create a temporary image element
                const img = new Image();
                img.src = canvas.toDataURL('image/png');
                
                // Create a temporary link to trigger the iOS share sheet
                const link = document.createElement('a');
                link.href = img.src;
                link.setAttribute('download', 'qr-code.png');
                
                // Create a temporary container for the image
                const tempContainer = document.createElement('div');
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                tempContainer.appendChild(img);
                document.body.appendChild(tempContainer);
                
                // Trigger the iOS share sheet
                const shareData = {
                    files: [new File([dataURLtoBlob(img.src)], 'qr-code.png', { type: 'image/png' })],
                    title: 'Save QR Code',
                    text: 'Save this QR code to your photo album'
                };
                
                if (navigator.share) {
                    navigator.share(shareData)
                        .then(() => console.log('QR code shared successfully'))
                        .catch((error) => {
                            console.error('Error sharing QR code:', error);
                            // Fallback to regular download if sharing fails
                            link.click();
                        });
                } else {
                    // Fallback to regular download if Web Share API is not available
                    link.click();
                }
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(tempContainer);
                }, 1000);
            } else {
                // For non-iOS devices, use the regular download approach
                const link = document.createElement('a');
                link.download = 'qr-code.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
            console.log('QR code downloaded');
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Error downloading QR code. Please check the console for details.');
        }
    });

    // Helper function to convert data URL to Blob
    function dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
}); 