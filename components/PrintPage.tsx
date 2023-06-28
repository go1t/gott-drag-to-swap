import * as React from "react";
import styled from "styled-components";
import Actions from "./Actions";

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

  img {
    max-width: 100%;
  }
`;

interface Entry {
  title: string;
  images: string[];
}

interface PrintPageProps {
  entries: Entry[];
}

const PrintPage: React.FC<PrintPageProps> = ({ entries }) => {
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
                      <img src={image} alt="" />
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
