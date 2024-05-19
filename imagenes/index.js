// @ts-check
// import * as tf from '@tensorflow/tfjs';

function renderAsImage(tensor, canvas, { width = 0, height = 0}) {
    const context = canvas.getContext('2d');
    tf.browser.toPixels(tensor).then(pixels => {
        const imageData = new ImageData(pixels, width, height);
        context.putImageData(imageData, 0, 0);
        console.log("Renderizada imagen.");
    })
}

const inputImage = document.querySelector('img');
const canvasCropped = document.querySelector('canvas#cropped');
const canvasResized = document.querySelector('canvas#resized');
const canvasFlipped = document.querySelector('canvas#flipped');

const CROP_BOX_SIZE = 0.6;
const SCALE = 1.2;

if (!inputImage) {
    throw new Error("No se pudo encontrar el elemento <img />");
}

if (!canvasCropped) {
    throw new Error("No se pudo encontrar el elemento <canvas id='cropped' />");
}

tf.tidy(() => {
    const tensorImage = tf.browser.fromPixels(inputImage, 4);
    const [
        width,
        height,
        depth
    ] = tensorImage.shape;

    console.log(tensorImage.shape);

    const batch = tf.reshape([tensorImage.dataSync()], [1, width, height, depth])
    const box = tf.tensor2d([0, CROP_BOX_SIZE, 0, CROP_BOX_SIZE], [1, 4]);
    const [croppedWidth, croppedHeight] = [Math.round(CROP_BOX_SIZE * width), Math.round(CROP_BOX_SIZE * height)]

    const cropped = tf.image.cropAndResize(batch, box, [0], [3000, 3000], "bilinear");
    cropped.print();
    const pixels = cropped.arraySync()[0];

    renderAsImage(pixels, canvasCropped, {
        width: 3000,
        height: 3000 
    });
});