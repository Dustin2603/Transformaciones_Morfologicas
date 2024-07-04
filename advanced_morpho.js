let src = null;

function loadImage(event) {
    let image = document.getElementById('uploadedImage');
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = function () {
        src = cv.imread(image);
        displayImage('Imagen Cargada', src);
    };
}

function displayImage(title, mat) {
    let container = document.getElementById('imageContainer');
    container.innerHTML = '';

    let div = document.createElement('div');
    let titleElem = document.createElement('div');
    titleElem.innerText = title;

    let canvas = document.createElement('canvas');
    cv.imshow(canvas, mat);

    div.appendChild(titleElem);
    div.appendChild(canvas);
    container.appendChild(div);
}

function applyMorphologicalOperation(operation) {
    if (!src) {
        alert('Por favor, carga una imagen primero.');
        return;
    }

    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    let kernel = cv.Mat.ones(5, 5, cv.CV_8U);
    let result = new cv.Mat();

    switch (operation) {
        case 'aislamiento':
            // Aislamiento Morfológico
            cv.morphologyEx(gray, result, cv.MORPH_CLOSE, kernel);
            cv.morphologyEx(result, result, cv.MORPH_OPEN, kernel);
            break;
        case 'top_hat':
            // Top Hat
            cv.morphologyEx(gray, result, cv.MORPH_TOPHAT, kernel);
            break;
        case 'bot_hat':
            // Bot Hat
            cv.morphologyEx(gray, result, cv.MORPH_BLACKHAT, kernel);
            break;
        case 'gradiente por dilatacion':
            // Gradiente Morfológico por Dilatación
            let dilated = new cv.Mat();
            cv.dilate(gray, dilated, kernel);
            cv.subtract(dilated, gray, result);
            dilated.delete();
            break;
        case 'gradiente por erosion':
            // Gradiente Morfológico por Erosión
            let eroded = new cv.Mat();
            cv.erode(gray, eroded, kernel);
            cv.subtract(gray, eroded, result);
            eroded.delete();
            break;
        case 'gradiente simetrico':
            // Gradiente Morfológico Simétrico
            let gradDilated = new cv.Mat();
            let gradEroded = new cv.Mat();
            cv.dilate(gray, gradDilated, kernel);
            cv.erode(gray, gradEroded, kernel);
            cv.subtract(gradDilated, gradEroded, result);
            gradDilated.delete();
            gradEroded.delete();
            break;
        default:
            alert('Operación no reconocida.');
            gray.delete();
            kernel.delete();
            return;
    }

    displayImage('Resultado: ' + operation, result);

    gray.delete();
    kernel.delete();
    result.delete();
}
