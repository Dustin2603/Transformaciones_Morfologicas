function loadImage(event) {
    let image = document.getElementById('uploadedImage');
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = function () {
        processImage(image);
    };
}

function processImage(image) {
    let src = cv.imread(image);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    let binary = new cv.Mat();
    cv.threshold(gray, binary, 127, 255, cv.THRESH_BINARY);

    let hitOrMissResult = hitOrMissTransform(binary);
    let matrices = calculateMatrices(gray);

    displayResults(src, gray, binary, hitOrMissResult, matrices);

    src.delete();
    gray.delete();
    binary.delete();
}

function hitOrMissTransform(binary) {
    let hitKernel = cv.matFromArray(3, 3, cv.CV_8U, [
        0, 1, 0,
        1, 1, 1,
        0, 1, 0
    ]);

    let missKernel = cv.matFromArray(3, 3, cv.CV_8U, [
        1, 0, 1,
        0, 0, 0,
        1, 0, 1
    ]);

    let inverted = new cv.Mat();
    cv.bitwise_not(binary, inverted);

    let erosionHit = new cv.Mat();
    cv.erode(binary, erosionHit, hitKernel);

    let erosionMiss = new cv.Mat();
    cv.erode(inverted, erosionMiss, missKernel);

    let hitOrMiss = new cv.Mat();
    cv.bitwise_and(erosionHit, erosionMiss, hitOrMiss);

    console.log("erosionHit:", erosionHit.data);
    console.log("erosionMiss:", erosionMiss.data);
    console.log("hitOrMiss:", hitOrMiss.data);

    hitKernel.delete();
    missKernel.delete();
    inverted.delete();
    erosionHit.delete();
    erosionMiss.delete();

    return hitOrMiss;
}

function calculateMatrices(gray) {
    let kernel = cv.Mat.ones(5, 5, cv.CV_8U);

    let eroded = new cv.Mat();
    let dilated = new cv.Mat();
    let opened = new cv.Mat();
    let closed = new cv.Mat();

    cv.erode(gray, eroded, kernel);
    cv.dilate(gray, dilated, kernel);
    cv.morphologyEx(gray, opened, cv.MORPH_OPEN, kernel);
    cv.morphologyEx(gray, closed, cv.MORPH_CLOSE, kernel);

    kernel.delete();

    return { eroded, dilated, opened, closed };
}

function displayResults(src, gray, binary, hitOrMiss, matrices) {
    let container = document.getElementById('imageContainer');
    container.innerHTML = '';

    let titles = ['Imagen Original', 'Escala de Grises', 'Imagen Binaria', 'Resultado Hit-or-Miss', 'Erosión', 'Dilatación', 'Apertura', 'Cierre'];
    let images = [src, gray, binary, hitOrMiss, matrices.eroded, matrices.dilated, matrices.opened, matrices.closed];

    for (let i = 0; i < images.length; i++) {
        let div = document.createElement('div');
        let title = document.createElement('div');
        title.innerText = titles[i];

        let canvas = document.createElement('canvas');
        cv.imshow(canvas, images[i]);

        div.appendChild(title);
        div.appendChild(canvas);
        container.appendChild(div);
    }

    hitOrMiss.delete();
    matrices.eroded.delete();
    matrices.dilated.delete();
    matrices.opened.delete();
    matrices.closed.delete();
}

function createKernelCanvas(kernel) {
    let canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    let ctx = canvas.getContext('2d');

    let size = kernel.size();
    let data = kernel.data;

    let scale = Math.floor(canvas.width / size.width);

    for (let y = 0; y < size.height; y++) {
        for (let x = 0; x < size.width; x++) {
            ctx.fillStyle = data[y * size.width + x] === 1 ? 'black' : 'white';
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    }

    return canvas;
}