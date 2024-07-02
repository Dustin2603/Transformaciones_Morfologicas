// Function to load image and convert to grayscale
function loadImage(event) {
    let image = document.getElementById('uploadedImage');
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = function () {
        applyTransformations(image);
    };
}

// Function to apply morphological transformations
function applyTransformations(image) {
    let src = cv.imread(image);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

    let kernel = cv.Mat.ones(5, 5, cv.CV_8U);

    let eroded = new cv.Mat();
    let dilated = new cv.Mat();
    let opened = new cv.Mat();
    let closed = new cv.Mat();

    cv.erode(src, eroded, kernel);
    cv.dilate(src, dilated, kernel);
    cv.morphologyEx(src, opened, cv.MORPH_OPEN, kernel);
    cv.morphologyEx(src, closed, cv.MORPH_CLOSE, kernel);

    displayImages(src, eroded, dilated, opened, closed);

    src.delete();
    kernel.delete();
    eroded.delete();
    dilated.delete();
    opened.delete();
    closed.delete();
}

// Function to display the images
function displayImages(original, eroded, dilated, opened, closed) {
    let titles = ['Imagen Original', 'Imagen Erosionada', 'Imagen Dilatada', 'Imagen Abierta', 'Imagen Cerrada'];
    let images = [original, eroded, dilated, opened, closed];

    let container = document.getElementById('imageContainer');
    container.innerHTML = '';

    for (let i = 0; i < images.length; i++) {
        let div = document.createElement('div');
        let title = document.createElement('div');
        title.innerText = titles[i];

        let canvas = document.createElement('canvas');

        // Create a new Mat to store the resized image
        let resized = new cv.Mat();
        let newSize = new cv.Size(images[i].cols / 2, images[i].rows / 2); // Adjust the divisor to scale image
        cv.resize(images[i], resized, newSize, 0, 0, cv.INTER_AREA);

        cv.imshow(canvas, resized);

        div.appendChild(title);
        div.appendChild(canvas);
        container.appendChild(div);

        resized.delete();
    }
}
