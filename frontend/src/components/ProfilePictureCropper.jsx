/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import toast from "./toaster/Toast";

const CROP_SIZE = 256;
const OUTPUT_SIZE = 512;
const MAX_ZOOM = 3;

function ProfilePictureCropper({ file, onCancel, onCrop }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageSize, setImageSize] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const imageRef = useRef(null);
  const dragStart = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const scale = imageSize
    ? Math.max(CROP_SIZE / imageSize.width, CROP_SIZE / imageSize.height) *
      zoom
    : 1;
  const imageWidth = imageSize ? imageSize.width * scale : CROP_SIZE;
  const imageHeight = imageSize ? imageSize.height * scale : CROP_SIZE;

  useEffect(() => {
    if (!imageSize) return;
    const maxOffsetX = Math.max(0, (imageWidth - CROP_SIZE) / 2);
    const maxOffsetY = Math.max(0, (imageHeight - CROP_SIZE) / 2);
    setOffset((current) => ({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, current.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, current.y)),
    }));
  }, [imageHeight, imageSize, imageWidth]);

  const startDragging = (event) => {
    if (!imageSize) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const dragImage = (event) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const maxOffsetX = Math.max(0, (imageWidth - CROP_SIZE) / 2);
    const maxOffsetY = Math.max(0, (imageHeight - CROP_SIZE) / 2);
    setOffset({
      x: Math.max(
        -maxOffsetX,
        Math.min(maxOffsetX, start.offsetX + event.clientX - start.clientX),
      ),
      y: Math.max(
        -maxOffsetY,
        Math.min(maxOffsetY, start.offsetY + event.clientY - start.clientY),
      ),
    });
  };

  const stopDragging = () => {
    dragStart.current = null;
  };

  const cropImage = async () => {
    const image = imageRef.current;
    if (!image || !imageSize) return;

    setIsCropping(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to create an image canvas.");

      const sourceSize = CROP_SIZE / scale;
      const sourceX = Math.max(
        0,
        Math.min(
          imageSize.width - sourceSize,
          (imageSize.width - sourceSize) / 2 - offset.x / scale,
        ),
      );
      const sourceY = Math.max(
        0,
        Math.min(
          imageSize.height - sourceSize,
          (imageSize.height - sourceSize) / 2 - offset.y / scale,
        ),
      );
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      );

      const requestedType = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file?.type)
        ? file.type
        : "image/png";
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("Unable to create the cropped image.")),
          requestedType,
          0.92,
        );
      });
      const outputType = blob.type || "image/png";
      const extension = outputType.split("/")[1].replace("jpeg", "jpg");
      const fileName = file?.name.replace(/\.[^.]+$/, "") || "profile-picture";
      onCrop(
        new File([blob], `${fileName}-cropped.${extension}`, {
          type: outputType,
          lastModified: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Error cropping profile picture:", error);
      toast.error(
        "Crop failed",
        "Unable to process this photo. Please choose another image.",
      );
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-picture-crop-title"
        className="theme w-full max-w-md rounded-lg bg-gray-900 md:rounded-xl border border-white/10 p-5 shadow-2xl md:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="profile-picture-crop-title"
              className="text-base font-semibold text-white"
            >
              Adjust profile picture
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Drag the photo to position it inside the circle.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            aria-label="Cancel picture crop"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-center">
          <div
            className="relative h-64 w-64 touch-none select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-full border-2 border-emerald-400/80 bg-gray-900 shadow-[0_0_0_8px_rgba(16,185,129,0.08)]"
            onPointerDown={startDragging}
            onPointerMove={dragImage}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            {previewUrl && (
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Profile picture crop preview"
                draggable="false"
                onLoad={(event) =>
                  setImageSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
                onError={() => {
                  toast.error(
                    "Unable to load image",
                    "Please choose a valid image file.",
                  );
                  onCancel();
                }}
                className="pointer-events-none absolute max-w-none"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  left: `calc(50% + ${offset.x}px)`,
                  top: `calc(50% + ${offset.y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
            {!imageSize && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                Loading photo…
              </div>
            )}
          </div>
        </div>

        <label
          htmlFor="profile-picture-zoom"
          className="mb-2 mt-7 block text-xs font-medium text-gray-300"
        >
          Zoom
        </label>
        <input
          id="profile-picture-zoom"
          type="range"
          min="1"
          max={MAX_ZOOM}
          step="0.01"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="mt-1 flex justify-between text-[10px] text-gray-500">
          <span>Fit</span>
          <span>Zoom in</span>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-300 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={cropImage}
            disabled={!imageSize || isCropping}
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCropping ? "Preparing…" : "Use this photo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePictureCropper;
