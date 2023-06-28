import * as React from "react";
import { Variants, motion } from "framer-motion";
import styled from "styled-components";
import { DRAG_IMAGE_SIZE } from "./constants";

const DragImageBase = styled(motion.div)<{
  $imageUrl: string;
  $top?: number;
  $left?: number;
}>`
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: ${DRAG_IMAGE_SIZE}px;
  height: ${DRAG_IMAGE_SIZE}px;
  border-radius: 999px;
  border: 4px solid white;

  position: fixed;
  top: ${(props) => props.$top ?? -1000}px;
  left: ${(props) => props.$left ?? 0}px;
  pointer-events: none;

  background-image: url(${(props) => props.$imageUrl});
`;

interface DragImageProps {
  imageUrl: string;
  animation?: {
    type: "scale-up" | "move-to-center";
    initialPosition: {
      top: number;
      left: number;
    };
  };
}

const DragImage = React.forwardRef<HTMLDivElement, DragImageProps>(
  ({ imageUrl, animation }, ref) => {
    if (!animation) {
      return <DragImageBase ref={ref} $imageUrl={imageUrl} />;
    }

    switch (animation.type) {
      case "scale-up":
        return (
          <DragImageBase
            ref={ref}
            $imageUrl={imageUrl}
            $top={animation.initialPosition.top}
            $left={animation.initialPosition.left}
            style={{ position: "absolute" }}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
            }}
            exit={{
              scale: 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
        );
      case "move-to-center":
        return (
          <DragImageBase
            ref={ref}
            $imageUrl={imageUrl}
            $top={animation.initialPosition.top}
            $left={animation.initialPosition.left}
            style={{ position: "absolute" }}
            initial={{
              top: `${animation.initialPosition.top}px`,
              left: `${animation.initialPosition.left}px`,
            }}
            animate={{
              top: `calc(50% - ${DRAG_IMAGE_SIZE / 2}px)`,
              left: `calc(50% - ${DRAG_IMAGE_SIZE / 2}px)`,
            }}
            transition={{ duration: 0.15 }}
          />
        );
    }
  }
);

DragImage.displayName = "DragImage";

export default DragImage;
