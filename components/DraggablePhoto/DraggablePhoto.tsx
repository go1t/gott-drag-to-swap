import * as React from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { DRAG_IMAGE_SIZE } from "./constants";
import PhotoWithRippleInAnimation, {
  MOVE_CIRCLE_TO_CENTER_DELAY,
} from "./PhotoWithRippleInAnimation";
import DragImage from "./DragImage";

const Container = styled.div<{
  width: number;
  height: number;
  imageUrl: string;
}>`
  position: relative;
  overflow: hidden;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-repeat: no-repeat;
`;

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

const DraggablePhoto: React.FC<SwappablePhotoProps> = ({
  imageState,
  onDrop,
  width,
  height,
}) => {
  const [dragInitialPosition, setDragInitialPosition] = React.useState<{
    offsetLeft: number;
    offsetTop: number;
    pageX: number;
    pageY: number;
    rippleDiameter: number;
  }>();
  const [hasDragStart, setHasDragStart] = React.useState(false);
  const [hasDragEnter, setHasDragEnter] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // this ref is here so we can grab the drag image element to be used
  // for data transfer's drag image
  const dragImageRef = React.useRef<HTMLDivElement>(null);

  // When the long press starts, save the click position and offset so that we can animate
  // the ripple effect along with the drag iomage
  const onLongPress: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) {
      return;
    }
    const element = e.currentTarget;
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    setDragInitialPosition({
      pageX: e.pageX,
      pageY: e.pageY,
      offsetLeft: element.offsetLeft,
      offsetTop: element.offsetTop,
      rippleDiameter: diameter,
    });
  };

  // On drag start, use the drag image as the image in the event's data transfer
  // Also, save the image url there too.
  const onDragStart: React.DragEventHandler<HTMLDivElement> = (e) => {
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
  };

  // On drop, we will grab the image url from the event and call the onDrop
  // callback so the parent component can start replacing the state
  const onImageDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (!e.dataTransfer || imageState.state !== "default") return;
    setHasDragEnter(false);
    const newReplacement = e.dataTransfer.getData("text");
    if (newReplacement === imageState.imageUrl) return;
    onDrop({
      imageUrl: newReplacement,
      dropX: e.pageX - containerRef.current.offsetLeft,
      dropY: e.pageY - containerRef.current.offsetTop,
    });
  };

  return (
    <Container
      ref={containerRef}
      width={width}
      height={height}
      imageUrl={
        imageState.state === "default"
          ? imageState.imageUrl
          : imageState.originalImageUrl
      }
      draggable={imageState.state === "default"}
      // TODO: replace with long press handler
      onMouseDown={onLongPress}
      onDragStart={onDragStart}
      onDragEnter={(e) => {
        e.preventDefault();
        setHasDragEnter(true);
      }}
      onDragLeave={() => setHasDragEnter(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onImageDrop}
      onDragEnd={() => {
        setHasDragStart(false);
        setDragInitialPosition(undefined);
        setHasDragEnter(false);
      }}
      onDragExit={() => {
        setHasDragStart(false);
        setDragInitialPosition(undefined);
        setHasDragEnter(false);
      }}
      onMouseUp={() => setDragInitialPosition(undefined)}
    >
      {/**
       * ======= DRAG-START ANIMATION =======
       * This consists of three separate parts:
       * - drag image
       * - drag image on initial long press
       * - ripple animation
       */}
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
                      top:
                        dragInitialPosition.pageY -
                        dragInitialPosition.offsetTop -
                        DRAG_IMAGE_SIZE / 2,
                      left:
                        dragInitialPosition.pageX -
                        dragInitialPosition.offsetLeft -
                        DRAG_IMAGE_SIZE / 2,
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
                  top:
                    dragInitialPosition.pageY -
                    dragInitialPosition.offsetTop -
                    dragInitialPosition.rippleDiameter / 2,
                  left:
                    dragInitialPosition.pageX -
                    dragInitialPosition.offsetLeft -
                    dragInitialPosition.rippleDiameter / 2,
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

      {/**
       * ======= DRAG-OVER OVERLAY =======
       */}
      <AnimatePresence>
        {hasDragEnter && !dragInitialPosition && (
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

      {/**
       * ======= DROP ANIMATION (RIPPLE) =======
       * This consists of 2 parts:
       * - moving drag image to the center
       * - rippling the from the center to fill the container
       */}
      {imageState.state === "replacing-ripple" && (
        // TODO: maybe move this inside Replacement component?
        <>
          <motion.div
            initial={{ display: "none" }}
            animate={{ display: "block" }}
            transition={{ delay: MOVE_CIRCLE_TO_CENTER_DELAY }}
          >
            <PhotoWithRippleInAnimation
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

      {/**
       * ======= FADE ANIMATION (AFTER THE IMAGE IS SWAPPED) =======
       */}
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
    </Container>
  );
};

export default DraggablePhoto;
