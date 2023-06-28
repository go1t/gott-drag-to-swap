import styled from "styled-components";
import { DRAG_IMAGE_SIZE, SWAP_ANIMATION_DURATION } from "./constants";
import { motion } from "framer-motion";

const ClipCircle = styled(motion.div)`
  width: ${DRAG_IMAGE_SIZE}px;
  height: ${DRAG_IMAGE_SIZE}px;
  border-radius: 50%;
  border: 4px solid white;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 999;
`;

const Image = styled.div<{ width: number; height: number; imageUrl: string }>`
  position: absolute;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: url(${(props) => props.imageUrl});
  background-size: cover;
  background-repeat: no-repeat;
`;

export const MOVE_CIRCLE_TO_CENTER_DELAY = 0.15;

const PhotoWithRippleInAnimation: React.FC<{
  imageUrl: string;
  width: number;
  height: number;
}> = ({ imageUrl, width, height }) => {
  const diameter = Math.max(width, height) * 1.5;

  const transition = {
    duration: SWAP_ANIMATION_DURATION - MOVE_CIRCLE_TO_CENTER_DELAY,
    delay: MOVE_CIRCLE_TO_CENTER_DELAY,
  };
  return (
    <ClipCircle
      initial={{
        width: DRAG_IMAGE_SIZE,
        height: DRAG_IMAGE_SIZE,
        top: height / 2,
        left: width / 2,
        x: -DRAG_IMAGE_SIZE / 2,
        y: -DRAG_IMAGE_SIZE / 2,
      }}
      animate={{
        width: diameter,
        height: diameter,
        // This adjustment is to ensure that the image stays in place when the
        // circle scales up.
        top: (-diameter * Math.max(width / height, 1)) / 6,
        left: (-diameter * Math.max(height / width, 1)) / 6,
        // HACK: Ideally this should be 0,0 but the photo is a bit offset and I didn't
        // have the time to figure out yet why that is. This offset will likely need to be different
        // for different width&height combination too.
        // I have a feeling that we should be able to derive this offset based on the width & height
        // but the time is short, so I havne't got to it yet.
        x: 0,
        y: -6,
      }}
      transition={transition}
    >
      <Image width={width} height={height} imageUrl={imageUrl} />
    </ClipCircle>
  );
};

export default PhotoWithRippleInAnimation;
