import * as React from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { DRAG_IMAGE_SIZE } from "./constants";
import Replacement, { MOVE_CIRCLE_TO_CENTER_DELAY } from "./Replacement";
import DragImage from "./DragImage";

const Ripple = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.5s;
  opacity: 0.5;
  pointer-events: none;
`;

const Overlay = styled(motion.div)`
  background: rgba(255, 255, 255, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  pointer-events: none;
`;

export type ImageState =
  | {
      state: "default";
      imageUrl: string;
    }
  | {
      state: "replacing-ripple";
      originalImageUrl: string;
      replacementImageUrl: string;
      dropX: number;
      dropY: number;
    }
  | {
      state: "replacing-fade";
      originalImageUrl: string;
      replacementImageUrl: string;
    };

interface SwappablePhotoProps {
  imageState: ImageState;
  onDrop: (dropInfo: {
    imageUrl: string;
    dropX: number;
    dropY: number;
  }) => void;
  width: number;
  height: number;
}

const SwappablePhoto: React.FC<SwappablePhotoProps> = ({
  imageState,
  onDrop,
  width,
  height,
}) => {
  const [dragInitialPosition, setDragInitialPosition] = React.useState<{
    x: number;
    y: number;
    rippleDiameter: number;
    clientX: number;
    clientY: number;
  }>();
  const [hasDragStart, setHasDragStart] = React.useState(false);
  const [isDragEnter, setIsDragEnter] = React.useState(false);

  const dragImageRef = React.useRef<HTMLDivElement>(null);

  const onImageDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (!e.dataTransfer || imageState.state !== "default") return;
    setIsDragEnter(false);

    const newReplacement = e.dataTransfer.getData("text");
    if (newReplacement === imageState.imageUrl) return;
    onDrop({
      imageUrl: newReplacement,
      dropX: e.clientX - e.currentTarget.offsetLeft,
      dropY: e.clientY - e.currentTarget.offsetTop,
    });
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width,
        height,
        backgroundImage: `url(${
          imageState.state === "default"
            ? imageState.imageUrl
            : imageState.originalImageUrl
        })`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      draggable={imageState.state === "default"}
      // TODO: replace with long press handler
      onMouseDown={(e) => {
        if (e.button !== 0) {
          return;
        }
        const source = e.currentTarget;
        const diameter = Math.max(source.clientWidth, source.clientHeight);
        setDragInitialPosition({
          x: e.clientX - source.offsetLeft - diameter / 2,
          y: e.clientY - source.offsetTop - diameter / 2,
          clientX: e.clientX,
          clientY: e.clientY,
          rippleDiameter: Math.max(source.clientWidth, source.clientHeight),
        });
      }}
      onDragStart={(e) => {
        if (imageState.state !== "default") {
          return;
        }
        setHasDragStart(true);
        e.dataTransfer.clearData();
        if (dragImageRef.current) {
          e.dataTransfer.setDragImage(
            dragImageRef.current,
            DRAG_IMAGE_SIZE / 2,
            DRAG_IMAGE_SIZE / 2
          );
        }
        e.dataTransfer.setData("text", imageState.imageUrl);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragEnter(true);
      }}
      onDragLeave={() => {
        setIsDragEnter(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onImageDrop}
      onDragEnd={(e) => {
        setHasDragStart(false);
        setDragInitialPosition(undefined);
        setIsDragEnter(false);
      }}
      onDragExit={() => {
        setHasDragStart(false);
        setDragInitialPosition(undefined);
        setIsDragEnter(false);
      }}
      onMouseUp={(e) => {
        if (dragImageRef.current) {
          dragImageRef.current.style.top = `-1000px`;
        }
        setDragInitialPosition(undefined);
      }}
    >
      {imageState.state === "replacing-ripple" && (
        // TODO: maybe move this inside Replacement component?
        <>
          <motion.div
            initial={{ display: "none" }}
            animate={{ display: "block" }}
            transition={{ delay: MOVE_CIRCLE_TO_CENTER_DELAY }}
          >
            <Replacement
              imageUrl={imageState.replacementImageUrl}
              width={width}
              height={height}
            />
          </motion.div>
          {!hasDragStart && (
            <DragImage
              imageUrl={imageState.replacementImageUrl}
              animation={{
                type: "move-to-center",
                initialPosition: {
                  top: imageState.dropY - DRAG_IMAGE_SIZE / 2,
                  left: imageState.dropX - DRAG_IMAGE_SIZE / 2,
                },
              }}
            />
          )}
        </>
      )}

      <AnimatePresence>
        {isDragEnter && !dragInitialPosition && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.5,
              transition: { duration: 0.2, ease: "easeInOut" },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.1, ease: "easeInOut" },
            }}
          />
        )}
      </AnimatePresence>

      {imageState.state === "default" && (
        // TODO: maybe this could be its own component?
        <>
          {/* This version will be used as drag image */}
          <DragImage imageUrl={imageState.imageUrl} ref={dragImageRef} />
          {/* This will show up upon clicked */}
          {!hasDragStart && (
            <AnimatePresence>
              {dragInitialPosition && (
                <DragImage
                  imageUrl={imageState.imageUrl}
                  animation={{
                    type: "scale-up",
                    initialPosition: {
                      top: dragInitialPosition.clientY - DRAG_IMAGE_SIZE / 2,
                      left: dragInitialPosition.clientX - DRAG_IMAGE_SIZE / 2,
                    },
                  }}
                />
              )}
            </AnimatePresence>
          )}
          <AnimatePresence>
            {dragInitialPosition && (
              <Ripple
                style={{
                  top: dragInitialPosition.y,
                  left: dragInitialPosition.x,
                  width: `${dragInitialPosition.rippleDiameter}px`,
                  height: `${dragInitialPosition.rippleDiameter}px`,
                }}
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: 0.5,
                  scale: 4,
                  transition: { duration: 0.15, ease: "easeInOut" },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.1, ease: "easeInOut" },
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {imageState.state === "replacing-fade" && (
        <>
          <motion.div
            style={{
              position: "absolute",
              width: `${width}px`,
              height: `${height}px`,
              backgroundImage: `url(${imageState.replacementImageUrl})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              zIndex: 99,
            }}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          />
          <motion.div
            style={{
              background: "white",
              position: "absolute",
              width: `${width}px`,
              height: `${height}px`,
            }}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          ></motion.div>
        </>
      )}
    </div>
  );
};

export default SwappablePhoto;
