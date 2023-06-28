import * as React from "react";
import styled from "styled-components";
import Actions from "./Actions";
import SwappablePhoto, { ImageState } from "./SwappablePhoto/SwappablePhoto";
import { cloneDeep } from "lodash";
import { SWAP_ANIMATION_DURATION } from "./SwappablePhoto/constants";

const Wrapper = styled.div`
  width: 600px;
  margin: auto;
  color: #585858;
`;

const PrintWrapper = styled.div``;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 20px;
`;

const PageLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  background: #2778a5;
  border-radius: 8px;
  padding: 20px;
  margin: 17px 0 42px;
  justify-content: space-between;
`;

const PrintPhoto = styled.div`
  width: calc(50% - 10px);
`;

interface Entry {
  title: string;
  images: string[];
}

interface PrintPageProps {
  initialEntries: Entry[];
}

// assuming that photo urls are unique!
const swapImages = (
  entries: Entry[],
  originalImageUrl: string,
  replacingImageUrl: string
) => {
  const newEntries = cloneDeep(entries);

  // find entries for each image first
  const originalEntryIdx = entries.findIndex(
    (entry) => entry.images.indexOf(originalImageUrl) >= 0
  );
  const originalImageIdx = entries.reduce(
    (idx, entry) => Math.max(entry.images.indexOf(originalImageUrl), idx),
    -1
  );
  const replacingEntryIdx = entries.findIndex(
    (entry) => entry.images.indexOf(replacingImageUrl) >= 0
  );
  const replacingImageIdx = entries.reduce(
    (idx, entry) => Math.max(entry.images.indexOf(replacingImageUrl), idx),
    -1
  );

  if (originalEntryIdx < 0 || originalEntryIdx < 0) {
    throw new Error("Unexpected original between images outside entries");
  }

  newEntries[originalEntryIdx].images[originalImageIdx] = replacingImageUrl;
  newEntries[replacingEntryIdx].images[replacingImageIdx] = originalImageUrl;

  return newEntries;
};

interface SwappingState {
  originalImageUrl: string;
  replacementImageUrl: string;
  dropX: number;
  dropY: number;
}

const getImageState = (
  imageUrl: string,
  swappingState: SwappingState | undefined
): ImageState => {
  // if this image is being dropped on, show the ripple animation
  if (imageUrl === swappingState?.originalImageUrl) {
    return {
      state: "replacing-ripple",
      originalImageUrl: imageUrl,
      replacementImageUrl: swappingState.replacementImageUrl,
      dropX: swappingState.dropX,
      dropY: swappingState.dropY,
    };
  }

  // if this image is not being dropped on but is the one being swapped, we need to fade the swapping image in
  if (imageUrl === swappingState?.replacementImageUrl) {
    return {
      state: "replacing-fade",
      originalImageUrl: swappingState.replacementImageUrl,
      replacementImageUrl: swappingState.originalImageUrl,
    };
  }

  return {
    state: "default",
    imageUrl,
  };
};

const PrintPage: React.FC<PrintPageProps> = ({ initialEntries }) => {
  const [entries, setEntries] = React.useState(initialEntries);

  const [swappingState, setSwappingState] = React.useState<SwappingState>();

  return (
    <>
      <Wrapper>
        {entries.map((entry, i) => {
          return (
            <PrintWrapper key={i}>
              <Header>
                <Title>{entry.title}</Title>
                <Actions />
              </Header>
              <PageLayout>
                {entry.images.map((image) => {
                  return (
                    <PrintPhoto key={image}>
                      <SwappablePhoto
                        imageState={getImageState(image, swappingState)}
                        width={270}
                        height={151}
                        onDrop={(dropInfo) => {
                          setSwappingState({
                            originalImageUrl: image,
                            replacementImageUrl: dropInfo.imageUrl,
                            dropX: dropInfo.dropX,
                            dropY: dropInfo.dropY,
                          });

                          setTimeout(() => {
                            setEntries(
                              swapImages(entries, image, dropInfo.imageUrl)
                            );
                            setSwappingState(undefined);
                          }, SWAP_ANIMATION_DURATION * 1000);
                        }}
                      />
                    </PrintPhoto>
                  );
                })}
              </PageLayout>
            </PrintWrapper>
          );
        })}
      </Wrapper>
    </>
  );
};

export default PrintPage;
