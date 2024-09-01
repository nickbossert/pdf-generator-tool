document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileElem');
    const convertBtn = document.getElementById('convertBtn');
    const dateInput = document.getElementById('dateInput');
    const dayInput = document.getElementById('dayInput');
    const descriptionInput = document.getElementById('descriptionInput');
    let imageFiles = [];

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
            if (file.type.match('image.*')) imageFiles.push(file);
            else alert('Only image files are allowed.');
        });
    }

    convertBtn.addEventListener('click', () => {
        if (imageFiles.length === 0) {
            alert('Please upload at least one image.');
            return;
        }

        const pdf = new jsPDF();
        const margin = 10;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const maxLineWidth = pageWidth - margin * 2;

        // Add text inputs to the first page
        const dateText = dateInput.value || "Date not provided";
        const dayText = dayInput.value || "Day not provided";
        const descriptionText = descriptionInput.value || "Description not provided";

        pdf.text(margin, 20, `Date: ${dateText}`);
        pdf.text(margin, 30, `Day: ${dayText}`);
        
        // Handle line breaks and text wrapping for description
        const descriptionLines = descriptionText.split('\n').map(line => pdf.splitTextToSize(line, maxLineWidth));
        let yOffset = 40;
        descriptionLines.forEach(lines => {
            pdf.text(margin, yOffset, lines);
            yOffset += lines.length * 10;
        });

        // Add each image on a new page
        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = event => {
                const img = new Image();
                img.onload = () => {
                    const imgWidth = pageWidth - 20; // Keep margins in consideration
                    const imgHeight = (img.height / img.width) * imgWidth;

                    if (index > 0) pdf.addPage(); // Start a new page for each image
                    pdf.addImage(img, 'JPEG', 10, 10, imgWidth, imgHeight);
                    
                    if (index === imageFiles.length - 1) {
                        pdf.save('images.pdf');
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    });
});
