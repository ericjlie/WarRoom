/* eslint-disable react/prop-types */
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
// import sampleArray from '../../exampleData/data';
import PopulateList from './PopulateList';
import UserContext from '../UserContext';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #131516;
  width: 100%;
  max-height: 100%;
  min-height: 100%;
  border: 10px;
  border-radius: 0px 0px 5px 5px;
  z-index: 5;
`;
const Header = styled.div`
  font-family: 'Macondo', cursive !important;
  max-height: 4%;
  min-height: 4%;
  font-size: large;
  text-align: center;
  padding: 10px 0px;
  background-color: #181b1e;
  text-shadow: 2px 2px 2px #00000078;
  border-bottom: 1px solid #ffffff9f;
`;

const CharacterContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-height: 100%;
  `;

const BoardCard = styled.div`
  flex-grow: 1;
  min-height: calc(45.5% - 20px);
  max-height: calc(45.5% - 20px);
  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  border-radius: 0px 0px 10px 10px;
`;

function List({ setMonster, setRender, monsterArr }) {
  // eslint-disable-next-line no-unused-vars
  const [count, setCount] = useState(0);
  const { currentUser, userList } = useContext(UserContext);
  let onIndex = -1;
  let offIndex = -1;
  return (
    <ListContainer>
      <CharacterContainer>
        <Header>
          On Board
          <div
            style={{
              display: "inline-block",
              backgroundColor: `${
                userList.filter(
                  (e) => e.name === currentUser.displayName
                ).length > 0
                  ? (userList.filter(
                    (e) => e.name === currentUser.displayName
                  )[0].color)
                  : null
              }`,
              borderRadius: "100px",
              width: "10px",
              height: "10px",
              marginLeft: "10px",
            }}
          />
        </Header>
        <BoardCard>
          {monsterArr.map((e) => {
            onIndex += 1;
            if (e.onBoard) {
              return (
                <PopulateList
                  index={onIndex}
                  monster={e}
                  setMonster={setMonster}
                  setRender={setRender}
                />
              );
            }
            return <div />;
          })}
        </BoardCard>
        <Header>Off Board</Header>
        <BoardCard>
          {monsterArr.map((e) => {
            offIndex += 1;
            if (!e.onBoard) {
              return (
                <PopulateList
                  index={offIndex}
                  monster={e}
                  setMonster={setMonster}
                  setRender={setRender}
                  setCount={setCount}
                />
              );
            }
            return <div />;
          })}
        </BoardCard>
      </CharacterContainer>
    </ListContainer>
  );
}

export default List;
