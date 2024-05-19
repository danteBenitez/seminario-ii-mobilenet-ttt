const form = document.querySelector("form");
const imageInput = document.querySelector("input");
const selectedImage = document.querySelector("#selected-image");

async function loadModel() {
  const model = await mobilenet.load();
  return model;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function flushDom() {
    // Hack to flush the DOM changes to the browser
    await delay(0);
}

async function classifyImage(model, img) {
  const predictions = await model.classify(img);
  return predictions;
}

document.addEventListener("DOMContentLoaded", async () => {
  imageInput.addEventListener("change", handleImageChange);
  const model = await loadModel();
  const btn = form.querySelector("[type=submit]");
  btn.removeAttribute("disabled");
  btn.innerHTML = "Reconocer imagen";
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Reconociendo imagen...
            `;
    btn.setAttribute("disabled", "disabled");
    await flushDom();
    const predictions = await handleImageUpload(model);
    renderPredictions(predictions);
    await flushDom();
    btn.removeAttribute("disabled");
    btn.innerHTML = "Reconocer imagen";
  });
});

function handleImageChange() {
  const formData = new FormData(form);
  const image = formData.get("image");
  const url = URL.createObjectURL(image);
  selectedImage.src = url;
  selectedImage.width = 224;
  selectedImage.height = 224;
}

async function handleImageUpload(model) {
  const predictions = await classifyImage(model, selectedImage);
  return predictions;
}

function renderPredictions(predictions) {
  const predictionsList = document.querySelector("#predictions");
  const html = predictions.map(
    (prediction) =>
      `
            <tr class="">
                <td>${prediction.className}</td>
                <td>${prediction.probability.toFixed(4) * 100}%</td>
            </tr>
        `
  );
  predictionsList.innerHTML = html.join("");
}
