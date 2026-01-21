import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

  try {
    // Backend gráfico = MUCHO más estable que CPU
    await tf.setBackend("webgl");
    await tf.ready();

    console.log("TF Backend:", tf.getBackend());

    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

    modelsLoaded = true;
    console.log("Modelos cargados correctamente ✅");
  } catch (err) {
    console.error("Error cargando modelos:", err);
    throw err;
  }
}

export function capturePhotoBase64(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export async function getFaceDescriptorFromVideo(
  video: HTMLVideoElement,
  minConfidence = 0.25
): Promise<number[] | null> {
  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence
  });

  const result = await faceapi
    .detectSingleFace(video, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;

  return Array.from(result.descriptor);
}
