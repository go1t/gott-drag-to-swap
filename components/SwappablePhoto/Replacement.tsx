import styled from "styled-components";
import { CIRCLE_WIDTH, SWAP_ANIMATION_DURATION } from "./constants";
import { motion } from "framer-motion";

const ClipCircle = styled(motion.div)`
  width: ${CIRCLE_WIDTH}px;
  height: ${CIRCLE_WIDTH}px;
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

const Replacement: React.FC<{
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
        width: CIRCLE_WIDTH,
        height: CIRCLE_WIDTH,
        top: height / 2,
        left: width / 2,
        x: -CIRCLE_WIDTH / 2,
        y: -CIRCLE_WIDTH / 2,
      }}
      animate={{
        width: diameter,
        height: diameter,
        top: (-diameter * Math.max(width / height, 1)) / 6,
        left: (-diameter * Math.max(height / width, 1)) / 6,
        x: 0,
        // TODO: figure out why this offset is necessary
        y: -6,
      }}
      transition={transition}
    >
      <Image width={width} height={height} imageUrl={imageUrl} />
    </ClipCircle>
  );
};

export default Replacement;
