'use strict';

document.addEventListener('DOMContentLoaded', () => {
    let img = new Image();
    let chart;
    let canvasImage;
    let srcPixels = [];

    img.addEventListener('load', function (event) {
        canvasImage = document.getElementById('image');
        let ctx = canvasImage.getContext("2d");
        canvasImage.width = img.width;
        canvasImage.height = img.height;

        ctx.drawImage(img, 0, 0);
        srcPixels = ctx.getImageData(0, 0, img.width, img.height);

        generateHistorgram();
    });

    function handleFileSelect(evt) {
        let files = evt.target.files;
        if (files[0] != undefined) {
            img.src = URL.createObjectURL(files[0]);
            document.getElementById('navBar').style.display = "block";
            document.getElementById('histogramWrapper').style.display = "block";
        } else {
            console.log("canceled selection of new image");
        }
        canvasImage = document.getElementById('image');
    }

    function handleSelectChange() {
        if (img.src.length > 0) generateHistorgram();
    }

    function handleBrightnessChange(e) {
        const brightnessLabel = document.getElementById('label_brightness');
        const brightness = e.target.value;
        brightnessLabel.innerText = brightness;

        if (img.src.length > 0) computeBrightness(parseInt(brightness));
    }

    function handleRestore() {
        if (img.src.length > 0) {
            clearCanvas();
            resetImage();
        }
        resetBinWidth();
        resetBrightness();
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
    document.getElementById('bin_width').addEventListener('change', handleSelectChange, false);
    document.getElementById('brightness').addEventListener('input', handleBrightnessChange, false);
    document.getElementById('restore').addEventListener('click', handleRestore, false);

    function clearCanvas() {
        if (chart != undefined || chart != null) {
            chart.destroy();
        }
    }

    function resetBinWidth() {
        const binWidth = document.getElementById('bin_width');
        binWidth.value = 4;
    }

    function resetBrightness() {
        const brightness = document.getElementById('brightness');
        brightness.value = 0;
        const label_brightness = document.getElementById('label_brightness');
        label_brightness.innerText = 0;
    }

    function resetImage() {
        const ctx = canvasImage.getContext("2d");
        ctx.drawImage(img, 0, 0);
    }

    function computeBrightness(brightness) {
        const ctx = canvasImage.getContext("2d");
        const imgDst = ctx.createImageData(srcPixels.width, srcPixels.height);
        imgDst.data.set(srcPixels.data);

        for (let i = 0; i < imgDst.data.length; i += 4) {
            imgDst.data[i] = srcPixels.data[i] + brightness;
            imgDst.data[i + 1] = srcPixels.data[i + 1] + brightness;
            imgDst.data[i + 2] = srcPixels.data[i + 2] + brightness;
        }

        ctx.putImageData(imgDst, 0, 0);
        generateHistorgram();

    }

    function generateHistorgram() {
        // image data
        const ctxImage = canvasImage.getContext("2d");
        const width = canvasImage.width;
        const height = canvasImage.height;
        const imageData = ctxImage.getImageData(0, 0, width, height).data;

        // fill rgb-arrays with zeros
        let redData = new Array(255).fill(0);
        let greenData = new Array(255).fill(0);
        let blueData = new Array(255).fill(0);

        // count rgb values
        for (let i = 0; i < imageData.length; i += 4) {
            redData[imageData[i]]++;
            greenData[imageData[i + 1]]++;
            blueData[imageData[i + 2]]++;
        }

        // compute histogram axis range
        const binWidth = document.getElementById('bin_width');
        const partition = 256 / binWidth.value;
        let colorCount = 0;
        let labels = [];

        // loop to create x-axis labels
        for (let i = 0; colorCount < 256; i++) {
            let label = colorCount + " - ";
            colorCount += partition;
            label = label.concat(colorCount - 1);
            labels.push(label);
        }

        let redChunkData = [];
        let greenChunkData = [];
        let blueChunkData = [];
        let redVals = 0;
        let greenVals = 0;
        let blueVals = 0;
        // split image data into chunks
        for (let i = 0; i < 256; i++) {
            if ((i + 1) % partition == 0) {
                redChunkData.push(redVals);
                greenChunkData.push(greenVals);
                blueChunkData.push(blueVals);
                redVals = 0;
                greenVals = 0;
                blueVals = 0;
            }
            redVals += redData[i];
            greenVals += greenData[i];
            blueVals += blueData[i];
        }

        clearCanvas();
        const canvasChart = document.getElementById('chart');
        chart = new Chart(canvasChart, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'red',
                    data: redChunkData,
                    backgroundColor: 'rgba(180, 0, 0, 0.8)'
                },
                {
                    label: 'green',
                    data: greenChunkData,
                    backgroundColor: 'rgba(0, 180, 0, 0.8)'
                },
                {
                    label: 'blue',
                    data: blueChunkData,
                    backgroundColor: 'rgba(0, 0, 180, 0.8)'
                },
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
