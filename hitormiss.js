function loadImage(event) {
    let image = document.getElementById('uploadedImage');
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = function () {
        hitOrMissTransform(image);
    };
}

function hitOrMissTransform(image) {
    let src = cv.imread(image);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    
    let thresholded = new cv.Mat();
    cv.threshold(src, thresholded, 127, 255, cv.THRESH_BINARY);

    let hitKernel = cv.matFromArray(3, 3, cv.CV_8U, [0, 1, 0, 1, 1, 1, 0, 1, 0]);
    let missKernel = cv.matFromArray(3, 3, cv.CV_8U, [1, 0, 1, 0, 0, 0, 1, 0, 1]);

    let inverted = new cv.Mat();
    cv.bitwise_not(thresholded, inverted);

    let erosionHit = new cv.Mat();
    cv.erode(thresholded, erosionHit, hitKernel);

    let erosionMiss = new cv.Mat();
    cv.erode(inverted, erosionMiss, missKernel);

    let hitOrMiss = new cv.Mat();
    cv.bitwise_and(erosionHit, erosionMiss, hitOrMiss);

    displayHitOrMissImage(thresholded, erosionHit, erosionMiss, hitOrMiss, hitKernel, missKernel);

    src.delete();
    thresholded.delete();
    hitKernel.delete();
    missKernel.delete();
    inverted.delete();
    erosionHit.delete();
    erosionMiss.delete();
    hitOrMiss.delete();
}

function displayHitOrMissImage(imagenBinaria, erosionHit, erosionMiss, hitOrMiss, hitKernel, missKernel) {
    let container = document.getElementById('imageContainer');
    container.innerHTML = '';

    // Mostrar Kernel Hit
    let hitKernelDiv = document.createElement('div');
    let hitKernelTitle = document.createElement('div');
    hitKernelTitle.innerText = 'Kernel Hit';
    let hitKernelCanvas = createKernelCanvas(hitKernel);
    hitKernelDiv.appendChild(hitKernelTitle);
    hitKernelDiv.appendChild(hitKernelCanvas);
    container.appendChild(hitKernelDiv);

    // Mostrar Kernel Miss
    let missKernelDiv = document.createElement('div');
    let missKernelTitle = document.createElement('div');
    missKernelTitle.innerText = 'Kernel Miss';
    let missKernelCanvas = createKernelCanvas(missKernel);
    missKernelDiv.appendChild(missKernelTitle);
    missKernelDiv.appendChild(missKernelCanvas);
    container.appendChild(missKernelDiv);

    // Mostrar imágenes resultantes
    let titles = ['Imagen Binaria', 'Erosión Hit', 'Erosión Miss', 'Resultado Hit-or-Miss'];
    let images = [imagenBinaria, erosionHit, erosionMiss, hitOrMiss];

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
}

function createKernelCanvas(kernel) {
    let canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    let ctx = canvas.getContext('2d');

    let size = kernel.size();
    let data = kernel.data;

    // Escalar el kernel para que se ajuste al canvas
    let scale = Math.floor(canvas.width / size.width);

    for (let y = 0; y < size.height; y++) {
        for (let x = 0; x < size.width; x++) {
            ctx.fillStyle = data[y * size.width + x] === 1 ? 'black' : 'white';
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    }

    return canvas;
}
