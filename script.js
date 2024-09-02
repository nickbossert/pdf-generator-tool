document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const convertBtn = document.getElementById('convertBtn');
    const dateInput = document.getElementById('dateInput');
    const dayInput = document.getElementById('dayInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const previewArea = document.getElementById('preview-area');
    let imageFiles = [];

    // Set the date input to the current date and day input to the current day
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
    dayInput.value = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];

    // File drop handling
    dropArea.addEventListener('dragover', event => event.preventDefault());
    dropArea.addEventListener('dragleave', () => dropArea.style.borderColor = '#ccc');
    dropArea.addEventListener('drop', event => {
        event.preventDefault();
        dropArea.style.borderColor = '#ccc';
        handleFiles(event.dataTransfer.files);
    });

    fileInput.addEventListener('change', event => handleFiles(event.target.files));

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.match('image.*')) {
                imageFiles.push(file);
                previewImage(file);
            } else {
                alert('Only image files are allowed.');
            }
        });
    }

    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = event => {
            const imgElement = document.createElement('img');
            imgElement.src = event.target.result;
            imgElement.className = 'preview-image';
            previewArea.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    }

    convertBtn.addEventListener('click', () => {
        const pdf = new jsPDF();
        const margin = 10;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const maxLineWidth = pageWidth - margin * 2;

        // Add headers and date/day info
        pdf.setTextColor(0, 0, 139); // Dark blue color
        pdf.setFont('helvetica', 'bold');
        pdf.text(margin, 20, "Date:");
        pdf.text(margin, 30, "Day:");

        pdf.setTextColor(0, 0, 0); // Black color
        pdf.setFont('helvetica', 'normal');
        pdf.text(margin + 30, 20, `${dateInput.value.trim() || "Date not provided"}`);
        pdf.text(margin + 30, 30, `${dayInput.value || "Day not provided"}`);

        // Add description text
        let yOffset = 50;
        const descriptionLines = pdf.splitTextToSize(descriptionInput.value, maxLineWidth);
        descriptionLines.forEach(line => {
            pdf.text(margin, yOffset, line);
            yOffset += 10;
        });

        // Ensure the first image starts on a new page
        if (imageFiles.length > 0) {
            pdf.addPage();
            processImagesSequentially(pdf, pageWidth, imageFiles);
        } else {
            pdf.save('images.pdf');
        }
    });

    function processImagesSequentially(pdf, pageWidth, files, index = 0) {
        if (index >= files.length) {
            pdf.save('images.pdf');
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            const img = new Image();
            img.onload = () => {
                const imgWidth = pageWidth - 20;
                const imgHeight = (img.height / img.width) * imgWidth;
                pdf.addImage(img, 'JPEG', 10, 10, imgWidth, imgHeight);

                if (index < files.length - 1) pdf.addPage();
                processImagesSequentially(pdf, pageWidth, files, index + 1);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(files[index]);
    }
});
