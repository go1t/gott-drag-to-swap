import * as React from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { CIRCLE_WIDTH } from "./constants";
import Replacement, { MOVE_CIRCLE_TO_CENTER_DELAY } from "./Replacement";

const Ripple = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.5s;
  opacity: 0.5;
  pointer-events: none;
`;

const Overlay = styled(motion.div)`
  background: rgba(255, 255, 255, 0.2);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  pointer-events: none;
`;

const DragImage = styled(motion.div)`
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: ${CIRCLE_WIDTH}px;
  height: ${CIRCLE_WIDTH}px;
  border-radius: 999px;
  border: 4px solid white;

  position: fixed;
  top: -1000px;
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
  const [dragPosition, setDragPosition] = React.useState<{
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
      // TODO: replace with long press
      onMouseDown={(e) => {
        if (e.button !== 0) {
          return;
        }
        const source = e.currentTarget;
        const diameter = Math.max(source.clientWidth, source.clientHeight);
        setDragPosition({
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
            CIRCLE_WIDTH / 2,
            CIRCLE_WIDTH / 2
          );
        }
        e.dataTransfer.setData("text", imageState.imageUrl);
      }}
      onDragEnter={() => {
        setIsDragEnter(true);
      }}
      onDragLeave={() => {
        setIsDragEnter(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onImageDrop}
      onDragEnd={(e) => {
        setHasDragStart(false);
        setDragPosition(undefined);
        setIsDragEnter(false);
      }}
      onDragExit={() => {
        setHasDragStart(false);
        setDragPosition(undefined);
        setIsDragEnter(false);
      }}
      onMouseUp={(e) => {
        if (dragImageRef.current) {
          dragImageRef.current.style.top = `-1000px`;
        }
        setDragPosition(undefined);
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
          <DragImage
            style={{
              position: "absolute",
              backgroundImage: `url('${imageState.replacementImageUrl}')`,
              top: `${imageState.dropY - CIRCLE_WIDTH / 2}px`,
              left: `${imageState.dropX - CIRCLE_WIDTH / 2}px`,
              display: hasDragStart ? "none" : undefined,
              width: CIRCLE_WIDTH,
              height: CIRCLE_WIDTH,
              borderWidth: 4,
            }}
            initial={{
              top: `${imageState.dropY - CIRCLE_WIDTH / 2}px`,
              left: `${imageState.dropX - CIRCLE_WIDTH / 2}px`,
            }}
            animate={{
              top: `calc(50% - ${CIRCLE_WIDTH / 2}px)`,
              left: `calc(50% - ${CIRCLE_WIDTH / 2}px)`,
            }}
            transition={{ duration: 0.15 }}
          />
        </>
      )}

      <AnimatePresence>
        {isDragEnter && !dragPosition && (
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
          <DragImage
            ref={dragImageRef}
            style={{ backgroundImage: `url('${imageState.imageUrl}')` }}
          />
          {/* This will show up upon clicked */}
          <AnimatePresence>
            {dragPosition && (
              <DragImage
                style={{
                  backgroundImage: `url('${imageState.imageUrl}')`,
                  top: `${dragPosition.clientY - 30}px`,
                  left: `${dragPosition.clientX - 30}px`,
                  display: hasDragStart ? "none" : undefined,
                  zIndex: 999,
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                exit={{
                  scale: 0,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {dragPosition && (
              <Ripple
                style={{
                  top: dragPosition.y,
                  left: dragPosition.x,
                  width: `${dragPosition.rippleDiameter}px`,
                  height: `${dragPosition.rippleDiameter}px`,
                }}
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: 0.5,
                  scale: 4,
                  transition: { duration: 0.15, ease: "easeInOut" },
                }}
                exit={{
                  opacity: 0,
                  scale: 4,
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
