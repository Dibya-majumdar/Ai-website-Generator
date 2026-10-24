
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  LoaderCircle,
  Volume2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { apiClient } from "@/api/apiClient";

type VoiceAgentProps = {
  userId: string;
  onBack?: () => void;
};

type VoiceResponse = {
  transcript: string;
  answer: string;
  audioBase64: string;
};

export default function VoiceAgent({
  userId,
  onBack,
}: VoiceAgentProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("Ready to build something amazing");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      const recorder = recorderRef.current;

      // Prevent an unfinished recording from submitting after unmount.
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioRef.current?.pause();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  async function startRecording() {
    try {
      setError("");
      setTranscript("");
      setAnswer("");

      if (!userId) {
        throw new Error("Please log in before using the voice agent.");
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone access requires HTTPS or localhost."
        );
      }

      if (typeof MediaRecorder === "undefined") {
        throw new Error("Audio recording is not supported by this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const mimeType = supportedTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (mountedRef.current) {
          setRecording(false);
          setStatus("Recording failed");
          setError("Please check your microphone and try again.");
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (!mountedRef.current) return;

        if (!blob.size) {
          setStatus("No audio detected");
          setError("Please speak into your microphone and try again.");
          return;
        }

        await sendAudio(blob);
      };

      recorder.start();

      setRecording(true);
      setStatus("Listening to your instructions...");
    } catch (err) {
      if (!mountedRef.current) return;

      setStatus("Unable to start recording");
      setError(
        err instanceof Error
          ? err.message
          : "Could not access your microphone."
      );
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      setRecording(false);
      setStatus("Processing your request...");
      recorder.stop();
    }
  }

  async function sendAudio(blob: Blob) {
    if (busyRef.current) return;

    busyRef.current = true;
    setProcessing(true);
    setError("");
    setStatus("Converting your speech into text...");

    try {
      const extension = blob.type.includes("mp4")
        ? "mp4"
        : blob.type.includes("ogg")
          ? "ogg"
          : "webm";

      const formData = new FormData();

      formData.append("audio", blob, `recording.${extension}`);
      formData.append("userId", userId);
      // No project ID is sent. The backend voice agent resolves the
      // project from the name spoken by the user.

      setStatus("Sending your instructions to AI...");

      const { data } = await apiClient.post<VoiceResponse>(
        "/api/voice/process",
        formData
      );

      if (!data.transcript || !data.answer || !data.audioBase64) {
        throw new Error("The backend returned an incomplete response.");
      }

      if (!mountedRef.current) return;

      setTranscript(data.transcript);
      setAnswer(data.answer);
      setStatus("Generating your spoken response...");

      audioRef.current?.pause();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], {
        type: "audio/mpeg",
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const player = new Audio(audioUrl);
      audioRef.current = player;

      player.onended = () => {
        if (mountedRef.current) {
          setStatus("Ready for your next instruction");
        }
      };

      player.onerror = () => {
        if (mountedRef.current) {
          setStatus("Audio playback failed");
          setError("Your AI response was received, but audio could not play.");
        }
      };

      setStatus("AI is speaking...");

      await player.play();
    } catch (err) {
      if (mountedRef.current) {
        setStatus("Something went wrong");

        setError(
          err instanceof Error
            ? err.message
            : "Voice processing failed."
        );
      }
    } finally {
      busyRef.current = false;

      if (mountedRef.current) {
        setProcessing(false);
      }
    }
  }

  function handleMicClick() {
    if (processing) return;

    if (recording) {
      stopRecording();
    } else {
      audioRef.current?.pause();
      void startRecording();
    }
  }

  return (
    <main className="awg-voice-page">
      <style>{`
        .awg-voice-page {
          min-height: 100%;
          box-sizing: border-box;
          padding: 28px;
          background: #090d16;
          color: #f8fafc;
          font-family: Inter, system-ui, sans-serif;
        }

        .awg-voice-page *,
        .awg-voice-page *::before,
        .awg-voice-page *::after {
          box-sizing: border-box;
        }

        .awg-voice-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 24px;
          border-bottom: 1px solid #202838;
        }

        .awg-voice-back {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border: 1px solid #293448;
          border-radius: 12px;
          background: #111827;
          color: #e2e8f0;
          cursor: pointer;
        }

        .awg-voice-back:hover {
          background: #1c2638;
        }

        .awg-voice-brand-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          color: #5eead4;
          background: #123b3b;
          border: 1px solid #205252;
          border-radius: 13px;
        }

        .awg-voice-brand h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .awg-voice-brand p {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 12px;
        }

        .awg-voice-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr);
          gap: 22px;
          max-width: 1120px;
          margin: 38px auto 0;
        }

        .awg-voice-main,
        .awg-voice-side {
          min-width: 0;
          padding: 24px;
          border: 1px solid #222d40;
          border-radius: 20px;
          background: #101622;
        }

        .awg-voice-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #5eead4;
          font-size: 12px;
          font-weight: 650;
        }

        .awg-voice-heading {
          margin: 15px 0 10px;
          font-size: clamp(25px, 4vw, 36px);
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .awg-voice-description {
          margin: 0;
          color: #a1acc0;
          font-size: 14px;
          line-height: 1.8;
        }

        .awg-voice-orb-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 34px 0 20px;
        }

        .awg-voice-orb {
          display: grid;
          place-items: center;
          width: 148px;
          height: 148px;
          border: 1px solid #22625e;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 30%,
            #1d7771,
            #104b4a 50%,
            #10212d 100%
          );
          box-shadow: 0 0 65px #14b8a620;
          transition: transform .2s;
        }

        .awg-voice-orb.is-active {
          animation: awg-orb-pulse 1.5s infinite;
        }

        .awg-voice-mic {
          display: grid;
          place-items: center;
          width: 72px;
          height: 72px;
          margin-top: -34px;
          border: 5px solid #101622;
          border-radius: 50%;
          background: #0d9488;
          color: white;
          cursor: pointer;
          transition: background .2s, transform .2s;
        }

        .awg-voice-mic:hover:not(:disabled) {
          background: #0f766e;
          transform: scale(1.06);
        }

        .awg-voice-mic.is-recording {
          background: #dc4545;
        }

        .awg-voice-mic:disabled {
          opacity: .65;
          cursor: wait;
        }

        .awg-voice-status {
          margin: 18px 0 0;
          text-align: center;
          color: #d1d9e7;
          font-size: 14px;
          font-weight: 600;
        }

        .awg-voice-hint {
          margin: 8px 0 0;
          text-align: center;
          color: #8593aa;
          font-size: 12px;
          line-height: 1.6;
        }

        .awg-voice-error {
          margin-top: 16px;
          padding: 12px;
          border: 1px solid #783d45;
          border-radius: 10px;
          background: #301a22;
          color: #fecaca;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .awg-voice-side h2 {
          margin: 0 0 8px;
          font-size: 16px;
        }

        .awg-voice-side-description {
          margin: 0 0 20px;
          color: #8e9bb0;
          font-size: 12px;
          line-height: 1.7;
        }

        .awg-voice-step {
          display: flex;
          gap: 12px;
          padding: 15px 0;
          border-top: 1px solid #222d40;
        }

        .awg-voice-step-number {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #173b3b;
          color: #5eead4;
          font-size: 12px;
          font-weight: 700;
        }

        .awg-voice-step strong {
          display: block;
          font-size: 13px;
        }

        .awg-voice-step p {
          margin: 5px 0 0;
          color: #8996ab;
          font-size: 12px;
          line-height: 1.6;
        }

        .awg-voice-result {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #28364a;
          border-radius: 12px;
          background: #0b111d;
        }

        .awg-voice-result h3 {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0;
          color: #5eead4;
          font-size: 12px;
        }

        .awg-voice-result p {
          margin: 10px 0 0;
          color: #e2e8f0;
          font-size: 13px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        @keyframes awg-orb-pulse {
          50% {
            box-shadow: 0 0 85px #14b8a650;
            transform: scale(1.04);
          }
        }

        @media (max-width: 760px) {
          .awg-voice-page {
            padding: 16px;
          }

          .awg-voice-layout {
            grid-template-columns: minmax(0, 1fr);
            margin-top: 22px;
          }

          .awg-voice-main,
          .awg-voice-side {
            padding: 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .awg-voice-orb.is-active {
            animation: none;
          }
        }
      `}</style>

      <header className="awg-voice-topbar">
        {onBack && (
          <button
            type="button"
            className="awg-voice-back"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>
        )}

        <div className="awg-voice-brand-icon">
          <Sparkles size={22} />
        </div>

        <div className="awg-voice-brand">
          <h1>AiWebGen Voice Studio</h1>
          <p>Build websites through natural conversation</p>
        </div>
      </header>

      <div className="awg-voice-layout">
        <section className="awg-voice-main">
          <span className="awg-voice-eyebrow">
            <Sparkles size={15} />
            YOUR AI WEBSITE BUILDER
          </span>

          <h2 className="awg-voice-heading">
            Imagine it.
            <br />
            Speak it. Build it.
          </h2>

          <p className="awg-voice-description">
            Tell your AI what kind of website you want. Describe
            the design, features, colors, and functionality naturally.
          </p>

          <div className="awg-voice-orb-area">
            <div
              className={`awg-voice-orb ${
                recording || processing ? "is-active" : ""
              }`}
            >
              {processing ? (
                <LoaderCircle
                  size={55}
                  color="#ccfbf1"
                  className="awg-voice-spinner"
                />
              ) : (
                <Sparkles size={55} color="#ccfbf1" />
              )}
            </div>

            <button
              type="button"
              className={`awg-voice-mic ${
                recording ? "is-recording" : ""
              }`}
              onClick={handleMicClick}
              disabled={processing}
              aria-label={recording ? "Stop recording" : "Start recording"}
            >
              {processing ? (
                <LoaderCircle size={25} />
              ) : recording ? (
                <Square size={23} fill="currentColor" />
              ) : (
                <Mic size={27} />
              )}
            </button>

            <p className="awg-voice-status" aria-live="polite">
              {status}
            </p>

            <p className="awg-voice-hint">
              {recording
                ? "Speak naturally, then click stop"
                : processing
                  ? "Please wait while your request is processed"
                  : "Click the microphone to start speaking"}
            </p>
          </div>

          {error && (
            <div className="awg-voice-error" role="alert">
              {error}
            </div>
          )}

          {transcript && (
            <div className="awg-voice-result">
              <h3>You said</h3>
              <p>{transcript}</p>
            </div>
          )}

          {answer && (
            <div className="awg-voice-result">
              <h3>
                <Volume2 size={15} />
                AI RESPONSE
              </h3>
              <p>{answer}</p>
            </div>
          )}
        </section>

        <aside className="awg-voice-side">
          <h2>How it works</h2>

          <p className="awg-voice-side-description">
            Your spoken instructions travel through your AI
            website-building pipeline.
          </p>

          <div className="awg-voice-step">
            <span className="awg-voice-step-number">01</span>
            <div>
              <strong>Speak your idea</strong>
              <p>Describe the website you want to create.</p>
            </div>
          </div>

          <div className="awg-voice-step">
            <span className="awg-voice-step-number">02</span>
            <div>
              <strong>AI understands</strong>
              <p>Speech is transcribed and sent to your AI service.</p>
            </div>
          </div>

          <div className="awg-voice-step">
            <span className="awg-voice-step-number">03</span>
            <div>
              <strong>Generate your website</strong>
              <p>Your existing backend handles the generation workflow.</p>
            </div>
          </div>

          <div className="awg-voice-step">
            <span className="awg-voice-step-number">04</span>
            <div>
              <strong>Listen to the response</strong>
              <p>Hear the AI response in generated speech.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}




















// import { useEffect, useRef, useState } from "react";
// import {
//   Mic,
//   Square,
//   LoaderCircle,
//   Volume2,
//   Sparkles,
//   ArrowLeft,
// } from "lucide-react";
// import { apiClient } from "@/api/apiClient";

// type VoiceAgentProps = {
//   userId: string;
//   projectId?: string;
//   onBack?: () => void;
// };

// type VoiceResponse = {
//   transcript: string;
//   answer: string;
//   audioBase64: string;
// };

// export default function VoiceAgent({
//   userId,
//   projectId,
//   onBack,
// }: VoiceAgentProps) {
//   const [recording, setRecording] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [status, setStatus] = useState("Ready to build something amazing");
//   const [transcript, setTranscript] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [error, setError] = useState("");

//   const recorderRef = useRef<MediaRecorder | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const chunksRef = useRef<Blob[]>([]);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const audioUrlRef = useRef<string | null>(null);
//   const busyRef = useRef(false);
//   const mountedRef = useRef(false);

//   useEffect(() => {
//     mountedRef.current = true;

//     return () => {
//       mountedRef.current = false;

//       const recorder = recorderRef.current;

//       // Prevent an unfinished recording from submitting after unmount.
//       if (recorder && recorder.state !== "inactive") {
//         recorder.onstop = null;
//         recorder.stop();
//       }

//       streamRef.current?.getTracks().forEach((track) => track.stop());
//       audioRef.current?.pause();

//       if (audioUrlRef.current) {
//         URL.revokeObjectURL(audioUrlRef.current);
//       }
//     };
//   }, []);

//   async function startRecording() {
//     try {
//       setError("");
//       setTranscript("");
//       setAnswer("");

//       if (!userId || !projectId) {
//         throw new Error(
//           "A user ID and project ID are required to start building."
//         );
//       }

//       if (!navigator.mediaDevices?.getUserMedia) {
//         throw new Error(
//           "Microphone access requires HTTPS or localhost."
//         );
//       }

//       if (typeof MediaRecorder === "undefined") {
//         throw new Error("Audio recording is not supported by this browser.");
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });

//       if (!mountedRef.current) {
//         stream.getTracks().forEach((track) => track.stop());
//         return;
//       }

//       streamRef.current = stream;
//       chunksRef.current = [];

//       const supportedTypes = [
//         "audio/webm;codecs=opus",
//         "audio/webm",
//         "audio/mp4",
//       ];

//       const mimeType = supportedTypes.find((type) =>
//         MediaRecorder.isTypeSupported(type)
//       );

//       const recorder = mimeType
//         ? new MediaRecorder(stream, { mimeType })
//         : new MediaRecorder(stream);

//       recorderRef.current = recorder;

//       recorder.ondataavailable = (event: BlobEvent) => {
//         if (event.data.size > 0) {
//           chunksRef.current.push(event.data);
//         }
//       };

//       recorder.onerror = () => {
//         stream.getTracks().forEach((track) => track.stop());
//         streamRef.current = null;

//         if (mountedRef.current) {
//           setRecording(false);
//           setStatus("Recording failed");
//           setError("Please check your microphone and try again.");
//         }
//       };

//       recorder.onstop = async () => {
//         stream.getTracks().forEach((track) => track.stop());
//         streamRef.current = null;

//         const blob = new Blob(chunksRef.current, {
//           type: recorder.mimeType || "audio/webm",
//         });

//         if (!mountedRef.current) return;

//         if (!blob.size) {
//           setStatus("No audio detected");
//           setError("Please speak into your microphone and try again.");
//           return;
//         }

//         await sendAudio(blob);
//       };

//       recorder.start();

//       setRecording(true);
//       setStatus("Listening to your instructions...");
//     } catch (err) {
//       if (!mountedRef.current) return;

//       setStatus("Unable to start recording");
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Could not access your microphone."
//       );
//     }
//   }

//   function stopRecording() {
//     const recorder = recorderRef.current;

//     if (recorder && recorder.state !== "inactive") {
//       setRecording(false);
//       setStatus("Processing your request...");
//       recorder.stop();
//     }
//   }

//   async function sendAudio(blob: Blob) {
//     if (busyRef.current) return;

//     busyRef.current = true;
//     setProcessing(true);
//     setError("");
//     setStatus("Converting your speech into text...");

//     try {
//       const extension = blob.type.includes("mp4")
//         ? "mp4"
//         : blob.type.includes("ogg")
//           ? "ogg"
//           : "webm";

//       const formData = new FormData();

//       formData.append("audio", blob, `recording.${extension}`);
//       formData.append("userId", userId);
//       formData.append("projectId", projectId);

//       // Bracket notation fixes the TypeScript index-signature warning.
//       const apiBase =
//         import.meta.env["VITE_API_BASE_URL"] ||
//         "http://localhost:8080";

//       setStatus("Sending your instructions to AI...");

//       // const response = await fetch(`${apiBase}/api/voice/process`, {
//       //   method: "POST",
//       //   body: formData,
//       //   // Add your existing JWT Authorization header here if required.
//       // });
//       const { data } = await apiClient.post<VoiceResponse>(
//   "/api/voice/process",
//   formData
// );

// if (!data.transcript || !data.answer || !data.audioBase64) {
//   throw new Error("The backend returned an incomplete response.");
// }

//       // if (!response.ok) {
//       //   const message = await response.text();

//       //   throw new Error(
//       //     message || `Backend request failed (${response.status}).`
//       //   );
//       // }

//       // const data = (await response.json()) as VoiceResponse;

//       // if (!data.transcript || !data.answer || !data.audioBase64) {
//       //   throw new Error("The backend returned an incomplete response.");
//       // }

//       if (!mountedRef.current) return;

//       setTranscript(data.transcript);
//       setAnswer(data.answer);
//       setStatus("Generating your spoken response...");

//       audioRef.current?.pause();

//       if (audioUrlRef.current) {
//         URL.revokeObjectURL(audioUrlRef.current);
//       }

//       const binary = atob(data.audioBase64);
//       const bytes = new Uint8Array(binary.length);

//       for (let i = 0; i < binary.length; i++) {
//         bytes[i] = binary.charCodeAt(i);
//       }

//       const audioBlob = new Blob([bytes], {
//         type: "audio/mpeg",
//       });

//       const audioUrl = URL.createObjectURL(audioBlob);
//       audioUrlRef.current = audioUrl;

//       const player = new Audio(audioUrl);
//       audioRef.current = player;

//       player.onended = () => {
//         if (mountedRef.current) {
//           setStatus("Ready for your next instruction");
//         }
//       };

//       player.onerror = () => {
//         if (mountedRef.current) {
//           setStatus("Audio playback failed");
//           setError("Your AI response was received, but audio could not play.");
//         }
//       };

//       setStatus("AI is speaking...");

//       await player.play();
//     } catch (err) {
//       if (mountedRef.current) {
//         setStatus("Something went wrong");

//         setError(
//           err instanceof Error
//             ? err.message
//             : "Voice processing failed."
//         );
//       }
//     } finally {
//       busyRef.current = false;

//       if (mountedRef.current) {
//         setProcessing(false);
//       }
//     }
//   }

//   function handleMicClick() {
//     if (processing) return;

//     if (recording) {
//       stopRecording();
//     } else {
//       audioRef.current?.pause();
//       void startRecording();
//     }
//   }

//   return (
//     <main className="awg-voice-page">
//       <style>{`
//         .awg-voice-page {
//           min-height: 100%;
//           box-sizing: border-box;
//           padding: 28px;
//           background: #090d16;
//           color: #f8fafc;
//           font-family: Inter, system-ui, sans-serif;
//         }

//         .awg-voice-page *,
//         .awg-voice-page *::before,
//         .awg-voice-page *::after {
//           box-sizing: border-box;
//         }

//         .awg-voice-topbar {
//           display: flex;
//           align-items: center;
//           gap: 14px;
//           padding-bottom: 24px;
//           border-bottom: 1px solid #202838;
//         }

//         .awg-voice-back {
//           display: grid;
//           place-items: center;
//           width: 40px;
//           height: 40px;
//           flex-shrink: 0;
//           border: 1px solid #293448;
//           border-radius: 12px;
//           background: #111827;
//           color: #e2e8f0;
//           cursor: pointer;
//         }

//         .awg-voice-back:hover {
//           background: #1c2638;
//         }

//         .awg-voice-brand-icon {
//           display: grid;
//           place-items: center;
//           width: 42px;
//           height: 42px;
//           flex-shrink: 0;
//           color: #5eead4;
//           background: #123b3b;
//           border: 1px solid #205252;
//           border-radius: 13px;
//         }

//         .awg-voice-brand h1 {
//           margin: 0;
//           font-size: 18px;
//           font-weight: 700;
//         }

//         .awg-voice-brand p {
//           margin: 5px 0 0;
//           color: #94a3b8;
//           font-size: 12px;
//         }

//         .awg-voice-layout {
//           display: grid;
//           grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr);
//           gap: 22px;
//           max-width: 1120px;
//           margin: 38px auto 0;
//         }

//         .awg-voice-main,
//         .awg-voice-side {
//           min-width: 0;
//           padding: 24px;
//           border: 1px solid #222d40;
//           border-radius: 20px;
//           background: #101622;
//         }

//         .awg-voice-eyebrow {
//           display: inline-flex;
//           align-items: center;
//           gap: 7px;
//           color: #5eead4;
//           font-size: 12px;
//           font-weight: 650;
//         }

//         .awg-voice-heading {
//           margin: 15px 0 10px;
//           font-size: clamp(25px, 4vw, 36px);
//           line-height: 1.2;
//           letter-spacing: -1px;
//         }

//         .awg-voice-description {
//           margin: 0;
//           color: #a1acc0;
//           font-size: 14px;
//           line-height: 1.8;
//         }

//         .awg-voice-orb-area {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           padding: 34px 0 20px;
//         }

//         .awg-voice-orb {
//           display: grid;
//           place-items: center;
//           width: 148px;
//           height: 148px;
//           border: 1px solid #22625e;
//           border-radius: 50%;
//           background: radial-gradient(
//             circle at 35% 30%,
//             #1d7771,
//             #104b4a 50%,
//             #10212d 100%
//           );
//           box-shadow: 0 0 65px #14b8a620;
//           transition: transform .2s;
//         }

//         .awg-voice-orb.is-active {
//           animation: awg-orb-pulse 1.5s infinite;
//         }

//         .awg-voice-mic {
//           display: grid;
//           place-items: center;
//           width: 72px;
//           height: 72px;
//           margin-top: -34px;
//           border: 5px solid #101622;
//           border-radius: 50%;
//           background: #0d9488;
//           color: white;
//           cursor: pointer;
//           transition: background .2s, transform .2s;
//         }

//         .awg-voice-mic:hover:not(:disabled) {
//           background: #0f766e;
//           transform: scale(1.06);
//         }

//         .awg-voice-mic.is-recording {
//           background: #dc4545;
//         }

//         .awg-voice-mic:disabled {
//           opacity: .65;
//           cursor: wait;
//         }

//         .awg-voice-status {
//           margin: 18px 0 0;
//           text-align: center;
//           color: #d1d9e7;
//           font-size: 14px;
//           font-weight: 600;
//         }

//         .awg-voice-hint {
//           margin: 8px 0 0;
//           text-align: center;
//           color: #8593aa;
//           font-size: 12px;
//           line-height: 1.6;
//         }

//         .awg-voice-error {
//           margin-top: 16px;
//           padding: 12px;
//           border: 1px solid #783d45;
//           border-radius: 10px;
//           background: #301a22;
//           color: #fecaca;
//           font-size: 12px;
//           line-height: 1.6;
//           overflow-wrap: anywhere;
//         }

//         .awg-voice-side h2 {
//           margin: 0 0 8px;
//           font-size: 16px;
//         }

//         .awg-voice-side-description {
//           margin: 0 0 20px;
//           color: #8e9bb0;
//           font-size: 12px;
//           line-height: 1.7;
//         }

//         .awg-voice-step {
//           display: flex;
//           gap: 12px;
//           padding: 15px 0;
//           border-top: 1px solid #222d40;
//         }

//         .awg-voice-step-number {
//           display: grid;
//           place-items: center;
//           width: 30px;
//           height: 30px;
//           flex-shrink: 0;
//           border-radius: 9px;
//           background: #173b3b;
//           color: #5eead4;
//           font-size: 12px;
//           font-weight: 700;
//         }

//         .awg-voice-step strong {
//           display: block;
//           font-size: 13px;
//         }

//         .awg-voice-step p {
//           margin: 5px 0 0;
//           color: #8996ab;
//           font-size: 12px;
//           line-height: 1.6;
//         }

//         .awg-voice-result {
//           margin-top: 18px;
//           padding: 14px;
//           border: 1px solid #28364a;
//           border-radius: 12px;
//           background: #0b111d;
//         }

//         .awg-voice-result h3 {
//           display: flex;
//           align-items: center;
//           gap: 7px;
//           margin: 0;
//           color: #5eead4;
//           font-size: 12px;
//         }

//         .awg-voice-result p {
//           margin: 10px 0 0;
//           color: #e2e8f0;
//           font-size: 13px;
//           line-height: 1.7;
//           white-space: pre-wrap;
//           overflow-wrap: anywhere;
//         }

//         @keyframes awg-orb-pulse {
//           50% {
//             box-shadow: 0 0 85px #14b8a650;
//             transform: scale(1.04);
//           }
//         }

//         @media (max-width: 760px) {
//           .awg-voice-page {
//             padding: 16px;
//           }

//           .awg-voice-layout {
//             grid-template-columns: minmax(0, 1fr);
//             margin-top: 22px;
//           }

//           .awg-voice-main,
//           .awg-voice-side {
//             padding: 20px;
//           }
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .awg-voice-orb.is-active {
//             animation: none;
//           }
//         }
//       `}</style>

//       <header className="awg-voice-topbar">
//         {onBack && (
//           <button
//             type="button"
//             className="awg-voice-back"
//             onClick={onBack}
//             aria-label="Go back"
//           >
//             <ArrowLeft size={19} />
//           </button>
//         )}

//         <div className="awg-voice-brand-icon">
//           <Sparkles size={22} />
//         </div>

//         <div className="awg-voice-brand">
//           <h1>AiWebGen Voice Studio</h1>
//           <p>Build websites through natural conversation</p>
//         </div>
//       </header>

//       <div className="awg-voice-layout">
//         <section className="awg-voice-main">
//           <span className="awg-voice-eyebrow">
//             <Sparkles size={15} />
//             YOUR AI WEBSITE BUILDER
//           </span>

//           <h2 className="awg-voice-heading">
//             Imagine it.
//             <br />
//             Speak it. Build it.
//           </h2>

//           <p className="awg-voice-description">
//             Tell your AI what kind of website you want. Describe
//             the design, features, colors, and functionality naturally.
//           </p>

//           <div className="awg-voice-orb-area">
//             <div
//               className={`awg-voice-orb ${
//                 recording || processing ? "is-active" : ""
//               }`}
//             >
//               {processing ? (
//                 <LoaderCircle
//                   size={55}
//                   color="#ccfbf1"
//                   className="awg-voice-spinner"
//                 />
//               ) : (
//                 <Sparkles size={55} color="#ccfbf1" />
//               )}
//             </div>

//             <button
//               type="button"
//               className={`awg-voice-mic ${
//                 recording ? "is-recording" : ""
//               }`}
//               onClick={handleMicClick}
//               disabled={processing}
//               aria-label={recording ? "Stop recording" : "Start recording"}
//             >
//               {processing ? (
//                 <LoaderCircle size={25} />
//               ) : recording ? (
//                 <Square size={23} fill="currentColor" />
//               ) : (
//                 <Mic size={27} />
//               )}
//             </button>

//             <p className="awg-voice-status" aria-live="polite">
//               {status}
//             </p>

//             <p className="awg-voice-hint">
//               {recording
//                 ? "Speak naturally, then click stop"
//                 : processing
//                   ? "Please wait while your request is processed"
//                   : "Click the microphone to start speaking"}
//             </p>
//           </div>

//           {error && (
//             <div className="awg-voice-error" role="alert">
//               {error}
//             </div>
//           )}

//           {transcript && (
//             <div className="awg-voice-result">
//               <h3>You said</h3>
//               <p>{transcript}</p>
//             </div>
//           )}

//           {answer && (
//             <div className="awg-voice-result">
//               <h3>
//                 <Volume2 size={15} />
//                 AI RESPONSE
//               </h3>
//               <p>{answer}</p>
//             </div>
//           )}
//         </section>

//         <aside className="awg-voice-side">
//           <h2>How it works</h2>

//           <p className="awg-voice-side-description">
//             Your spoken instructions travel through your AI
//             website-building pipeline.
//           </p>

//           <div className="awg-voice-step">
//             <span className="awg-voice-step-number">01</span>
//             <div>
//               <strong>Speak your idea</strong>
//               <p>Describe the website you want to create.</p>
//             </div>
//           </div>

//           <div className="awg-voice-step">
//             <span className="awg-voice-step-number">02</span>
//             <div>
//               <strong>AI understands</strong>
//               <p>Speech is transcribed and sent to your AI service.</p>
//             </div>
//           </div>

//           <div className="awg-voice-step">
//             <span className="awg-voice-step-number">03</span>
//             <div>
//               <strong>Generate your website</strong>
//               <p>Your existing backend handles the generation workflow.</p>
//             </div>
//           </div>

//           <div className="awg-voice-step">
//             <span className="awg-voice-step-number">04</span>
//             <div>
//               <strong>Listen to the response</strong>
//               <p>Hear the AI response in generated speech.</p>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </main>
//   );
// }
