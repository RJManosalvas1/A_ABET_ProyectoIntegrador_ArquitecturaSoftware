import { useEffect, useRef, useState } from "react";
import {
  capturePhotoBase64,
  getFaceDescriptorFromVideo,
  loadModels,
} from "../faceClient";

type Props = {
  onCapture: (data: { descriptor: number[]; photoBase64?: string }) => void;
  withPhoto?: boolean;
};

export default function WebcamPanel({ onCapture, withPhoto = true }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [streamOn, setStreamOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Cargando modelos...");

  useEffect(() => {
    (async () => {
      try {
        await loadModels();
        setModelsReady(true);
        setStatus("Modelos listos ✅. Enciende cámara.");
      } catch (e) {
        setModelsReady(false);
        setStatus("Error cargando modelos. Revisa que exista /public/models");
      }
    })();

    // Limpieza al desmontar
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    if (busy) return;
    setBusy(true);

    try {
      // Si ya había un stream, lo paramos antes
      stopCamera();

      // 1) Intento "bonito" (mejor calidad)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        });
      } catch {
        // 2) Fallback "básico" para webcams flojas / drivers raros
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      const v = videoRef.current;
      if (!v) {
        // Si no hay video element, paramos el stream para no dejarlo colgado
        stream.getTracks().forEach((t) => t.stop());
        setStatus("No encontré el componente de video 😵");
        return;
      }

      streamRef.current = stream;
      v.srcObject = stream;
      v.muted = true;
      v.playsInline = true;

      // play() puede fallar si el navegador requiere interacción del usuario,
      // pero aquí ya viene de un click, así que debería ir.
      await v.play();

      // Espera a que haya metadata (dimensiones reales)
      await waitForVideoReady(v);

      setStreamOn(true);
      setStatus("Cámara lista ✅. Buena luz y rostro centrado.");
    } catch {
      setStreamOn(false);
      setStatus("No pude acceder a la cámara 😵. Revisa permisos del navegador.");
    } finally {
      setBusy(false);
    }
  }

  function stopCamera() {
    const v = videoRef.current;

    const stream = streamRef.current ?? (v?.srcObject as MediaStream | null);
    if (stream) stream.getTracks().forEach((t) => t.stop());

    if (v) v.srcObject = null;

    streamRef.current = null;
    setStreamOn(false);
  }

  async function capture() {
    if (busy) return;

    const v = videoRef.current;
    if (!v) return;

    if (!modelsReady) {
      setStatus("Modelos no listos todavía… espera 😅");
      return;
    }

    if (!streamOn) {
      setStatus("Primero enciende la cámara.");
      return;
    }

    setBusy(true);
    setStatus("Detectando rostro...");

    try {
      // Asegura que el video tenga tamaño válido
      await waitForVideoReady(v);

      const descriptor = await getFaceDescriptorFromVideo(v);

      if (!descriptor) {
        setStatus(
          "No detecté rostro 😅. Acércate / mejora luz / mira de frente."
        );
        return;
      }

      // Tu API espera number[], convertimos Float32Array -> number[]
      const descriptorArr = Array.from(descriptor);

      const photoBase64 = withPhoto ? capturePhotoBase64(v) : undefined;

      onCapture({ descriptor: descriptorArr, photoBase64 });
      setStatus("Captura lista ✅. Ya puedes enviar.");
    } catch (e) {
      setStatus("Falló la captura 😵. Prueba otra vez con más luz.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!streamOn ? (
          <button onClick={startCamera} disabled={!modelsReady || busy}>
            {busy ? "Iniciando..." : "Encender cámara"}
          </button>
        ) : (
          <button onClick={stopCamera} disabled={busy}>
            Apagar cámara
          </button>
        )}

        <button onClick={capture} disabled={!streamOn || !modelsReady || busy}>
          {busy ? "Procesando..." : "Capturar"}
        </button>

        <span style={{ fontSize: 12, opacity: 0.75 }}>
          {modelsReady ? "Models: ✅" : "Models: ⏳"} |{" "}
          {streamOn ? "Cam: ✅" : "Cam: ⛔"}
        </span>
      </div>

      <video
        ref={videoRef}
        style={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 12,
          border: "1px solid #333",
          background: "#111",
        }}
        playsInline
        muted
      />

      <div style={{ opacity: 0.85 }}>{status}</div>
    </div>
  );
}

async function waitForVideoReady(video: HTMLVideoElement) {
  // Si ya tiene dimensiones, ok
  if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
    return;
  }

  // Espera evento de metadata (con timeout)
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Video metadata timeout"));
    }, 4000);

    const onLoaded = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("canplay", onLoaded);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("canplay", onLoaded);

    // por si ya llegó
    onLoaded();
  });
}
