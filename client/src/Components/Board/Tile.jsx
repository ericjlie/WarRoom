import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import TileContent from './TileContent';

const TileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items:center;
  width: 100%;
  height: 100%;
  /* background-color: red; */
  /* border: 1px solid black; */
  background-image: url(${(props) => `./assets/square${props.number}.png`});
  background-size: cover;
`;

function Tile({
  x, y, index, number, move, monster, attacker, setAttacker, defender, setDefender, dimension, onBoard, setOnBoard, setError, sendNewBoard
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'image',
    drop: (item) => move(item.id, index, item.monster, item.reRender),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <TileContainer number={number} ref={drop} position={index}>
      <TileContent
        x={x}
        y={y}
        index={index}
        monster={monster}
        attacker={attacker}
        setAttacker={setAttacker}
        defender={defender}
        setDefender={setDefender}
        dimension={dimension}
        onBoard={onBoard}
        setOnBoard={setOnBoard}
        setError={setError}
        sendNewBoard={sendNewBoard}
      />
    </TileContainer>
  );
}

export default Tile;
