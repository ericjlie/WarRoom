/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Tile from './Tile';
import AutoBattleList from './AutoBattleList';
import UserContext from '../UserContext';
import { updateUserMonster } from '../../firebase-config';
import aStar from './utils/aStar/aStar';
import { Battle } from './utils/BattleFunc';

const BoardStyled = styled.div`
  display: grid;
  align-content: center;
  justify-content: center;
  grid-template-columns: repeat(${(props) => props.dimension || 8}, ${(props) => 90 / props.dimension || 8}%);
  grid-template-rows: repeat(${(props) => props.dimension || 8}, ${(props) => 90 / props.dimension || 8}%);
  height: 100%;
  width: 100%;
  margin-top: -30px;
`;

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* height: 800px; */
  /* width: 800px; */
  /* min-height: 100%;
  max-height: 100%;
  max-width: 100%;
  min-width: 100%; */
  max-width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
`;

const ErrorMessage = styled.div`
  display: flex;
  text-align: center;
  margin-top: 20px;
  opacity: 0;
  color: #ca0000;
  transition: all ease-in-out 0.3s;
  &.show {
    opacity: 1 !important;
    color: #ca0000;
    transition: all ease-in-out 0.3s;
  }
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
`;

const BattleCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 95%;
  height: 100%;
  background-color: #1d1f25;
  border-radius: 5px;
  padding: 10px;
  justify-content: center;
  align-items: center;
`;

function Board({
  socket, room, dimension, onBoard, setOnBoard,
}) {
  const { currentUser, userList } = useContext(UserContext);

  const [randomNumbers] = useState(
    Array.from({ length: dimension * dimension }, () => Math.ceil(Math.random() * 4)),
  );
  const [board, setBoard] = useState(
    Array.from({ length: dimension * dimension }, (element, index) => index),
  );
  // const [onBoard, setOnBoard] = useState({});
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);
  const [error, setError] = useState(false);
  const [send, setSend] = useState(false);
  const [monsterList, setMonsterList] = useState([]);
  const [monsterListCounter, setMonsterListCounter] = useState([]);
  const [battleList, setBattleList] = useState([{}]);

  const [turn, setTurn] = useState(userList.length > 0 ? userList[0].id : '');
  console.log('userList in monster list', userList);
  console.log('turn', turn);


  const sendNewBoard = (newBoard = onBoard) => {
    const newBoardSend = {
      new_board: newBoard,
      room,
    };
    socket.emit('send_new_board', newBoardSend);
  };
  const sendNewTurn = () => {
    const newTurnSend = {
      new_turn: turn,
      room,
    };
    socket.emit('send_new_turn', newTurnSend);
  };
  function endTurn() {
    console.log('---------endTurn is called--------', turn);
    // create for loop to go though userList and get the index of the user whos turn it is.
    // increament the currnet index by 1 or go back to 0 if we are at the end of the array of users.
    if (currentUser.uid === turn) {
      console.log('----if statement is working---');
      for (let i = 0; i < userList.length; i += 1) {
        if (userList[i].id === turn) {
          if (i + 1 < userList.length) {
            setTurn(userList[i + 1].id);
          } else {
            setTurn(userList[0].id);
          }
        }
      }
    }
    if (turn.length < 1) {
      setTurn(userList[0].id);
    }
    console.log('current turn ID', turn);
  }
  async function move(from, to, monster, reRender) {
    const fromX = Math.floor(from / dimension);
    const fromY = from % dimension;
    const toX = Math.floor(to / dimension);
    const toY = to % dimension;
    if (currentUser.uid !== turn || turn.length < 1) {
      setError('Its not your turn!');
      setTimeout(() => { setError(false); }, 3000);
    } else if (monster.userUID !== currentUser.uid) {
      setError('Trying to move something that is not yours?');
      setTimeout(() => { setError(false); }, 3000);
    } else if (
      monster.onBoard && Math.abs(toX - fromX) + Math.abs(toY - fromY) > (monster.movement / 5)
    ) {
      setError('That is too far away!');
      setTimeout(() => { setError(false); }, 3000);
    } else if (!onBoard[to]) {
      monster.locationX = toX;
      monster.locationY = toY;
      monster.onBoard = true;
      setAttacker(null);
      setDefender(null);
      const tempBoard = onBoard;
      delete tempBoard[from];
      tempBoard[to] = monster;
      await setOnBoard(tempBoard);
      if (send) {
        setSend(false);
      } else {
        setSend(true);
      }
      updateUserMonster(currentUser.displayName, monster.id, {
        onBoard: true,
        locationX: monster.locationX,
        locationY: monster.locationY,
      })
        .then(() => {
          if (reRender) {
            reRender((previous) => previous + 1);
          }
        });
    } else {
      setError('You can not move there!');
      setTimeout(() => { setError(false); }, 3000);
    }
  }

  function handleAutoBattle() {
    function check(battleObj) {
      return battleObj.attacker && battleObj.defender && battleObj.attack;
    }
    const newCoords = {};
    const oldCoords = {};
    battleList.forEach((battle) => {
      oldCoords[battle.attacker.id] = [battle.attacker.locationX, battle.attacker.locationY];
    });
    if (battleList.every(check) && currentUser.uid === turn) {
      for (let i = 0; i < battleList.length; i += 1) {
        const battle = battleList[i];
        const tempBoard = { ...onBoard };
        if (Object.keys(newCoords).length) {
          Object.keys(newCoords).forEach((monsterId) => {
            if (newCoords[battle.attacker.id] && newCoords[monsterId].length) {
              const oldIndex = (newCoords[monsterId][0] * dimension) + newCoords[monsterId][1];
              delete tempBoard[oldIndex];
            }
          });
        }
        if (newCoords[battle.attacker.id] && newCoords[battle.attacker.id].length) {
          battle.attacker.locationX = newCoords[battle.attacker.id][0];
          battle.attacker.locationY = newCoords[battle.attacker.id][1];
        }
        const path = aStar(dimension, tempBoard, battle.attacker, battle.defender);
        if (path.length
          && path.length - 1 < ((battle.attacker.movement / 5) + (battle.attack.range / 5))
        ) {
          newCoords[battle.attacker.id] = path[0];
          delete oldCoords[battle.attacker.id];
        } else {
          newCoords[battle.attacker.id] = null;
        }
      }
      Promise.all(battleList.map((battle, index) => {
        let newIndex = newCoords[battle.attacker.id] ? newCoords[battle.attacker.id] : null;
        if (newIndex) {
          newIndex = (newIndex[0] * dimension) + newIndex[1];
          const oldIndex = (battle.attacker.locationX * dimension) + battle.attacker.locationY;
          return (
            move(oldIndex, newIndex, battle.attacker)
              .then(() => battle)
          );
        }
        console.log(`${currentUser.displayName}'s ${battle.attacker.name} could not find a valid path.`);
      }))
        .then((results) => {
          Promise.all(
            results.map(async (battle) => {
              console.log(battle);
              let multiple = battle.attack.multiplier;
              while (multiple > 0) {
                const message = await Battle(battle.attacker, battle.defender, battle.attack);
                const logMessageData = {
                  message,
                  board: room,
                  id: uuidv4(),
                };
                socket.emit('send_log_message', logMessageData);
                multiple -= 1;
              }
              if (battle.defender.currentHealth <= 0) {
                return Promise.resolve(
                  (battle.defender.locationX * dimension) + battle.defender.locationY,
                );
              }
            }),
          )
            .then((data) => {
              const tempBoard = { ...onBoard };
              console.log('old coords', oldCoords);
              data.forEach((deadInd) => {
                delete tempBoard[deadInd];
              });
              setOnBoard(tempBoard);
              sendNewBoard(tempBoard);
            });
        });
    } else if (currentUser.uid !== turn) {
      setError('Not your turn');
    } else {
      setError('Pick an attack');
    }
  }
  useEffect(() => {
    // console.log('userList', userList);
    // if (turn.length < 1 && !(userList.length > 0)) {
    //   setTurn(userList[0].id);
    // }
    sendNewTurn();
  }, [turn]);

  useEffect(() => {
    if (JSON.stringify(onBoard) !== '{}') {
      sendNewBoard();
    }
  }, [send]);

  useEffect(() => {
    socket.on('recieve_new_board', (newBoardSend) => {
      setOnBoard(newBoardSend.new_board);
    });
  }, [socket]);

  useEffect(() => {
    socket.on('recieve_new_turn', (newTurn) => {
      setTurn(newTurn.new_turn);
    });
  }, [socket]);

  useEffect(() => {
    const myTemp = [];
    const oppTemp = [];
    Object.values(onBoard).forEach((monster) => {
      if (monster && monster.userUID === currentUser.uid) {
        myTemp.push(monster);
      } else {
        oppTemp.push(monster);
      }
    });
    setMonsterList([myTemp, oppTemp]);
  }, [onBoard]);

  return (
    <BoardContainer>
      <MenuContainer>
        <div className="section full-height">
          <input
            className="modal-btn"
            type="checkbox"
            id="modal-btn"
            name="modal-btn"
          />
          <label htmlFor="modal-btn">
            Battle List
            <i className="uil uil-expand-arrows" />
          </label>

          <input
            className="modal-btn"
            disabled="disabled"
            type="checkbox"
            id="modal-btn2"
            name="modal-btn"
          />
          <label onClick={() => handleAutoBattle()} htmlFor="modal-btn2">
            Auto Battle
            <i className="uil uil-expand-arrows" />
          </label>

          <input
            className="modal-btn"
            disabled="disabled"
            type="checkbox"
            id="modal-btn3"
            name="modal-btn"
          />
          <label onClick={() => endTurn()} htmlFor="modal-btn3" className="danger">
            {turn.length < 1 ? 'Connect To Game' : currentUser.uid === turn ? 'End Turn' : 'Waiting'}
            <i className="uil uil-expand-arrows" />
          </label>

          <div className="modal">
            <div className="modal-wrap">
              <h4>Auto Battle List</h4>
              <BattleCardContainer>
                {monsterList.length > 0
                  ? battleList.map((el, index) => (
                    <AutoBattleList
                      key={index}
                      monsters={monsterList}
                      setBattleList={setBattleList}
                      battleList={battleList}
                      battle={el}
                      setMonsterListCounter={setMonsterListCounter}
                      id={index}
                    />
                  )) : null}
                <div style={{ display: 'flex', flexDirection: 'rows' }}>
                  <AddCircleIcon
                    className="icon"
                    fontSize="large"
                    onClick={() => {
                      setMonsterList((prv) => [...prv, onBoard]);
                      setBattleList((prv) => [...prv, {}]);
                    }}
                    style={{ color: 'limegreen' }}
                  />
                  <AddCircleIcon
                    className="icon"
                    fontSize="large"
                    onClick={() => {
                      setBattleList((prev) => {
                        const copy = [...prev];
                        copy.pop();
                        return copy;
                      });
                    }}
                    style={{ color: 'red', transform: 'rotate(45deg)' }}
                  />
                </div>
              </BattleCardContainer>
            </div>
          </div>

          <a href="https://front.codes/" className="logo" target="_blank" rel="noreferrer" />
        </div>
      </MenuContainer>
      <BoardStyled dimension={dimension}>
        {board.map((tile, index) => (onBoard[index]
          ? (
            <Tile
              sendNewBoard={sendNewBoard}
              setError={setError}
              onBoard={onBoard}
              setOnBoard={setOnBoard}
              dimension={dimension}
              attacker={attacker}
              setAttacker={setAttacker}
              defender={defender}
              setDefender={setDefender}
              move={move}
              x={Math.floor(index / dimension)}
              y={index % dimension}
              key={uuidv4()}
              className="tile"
              index={index}
              number={randomNumbers[index]}
              monster={onBoard[index]}
            />
          )
          : (
            <Tile
              sendNewBoard={sendNewBoard}
              onBoard={onBoard}
              setOnBoard={setOnBoard}
              dimension={dimension}
              attacker={attacker}
              setAttacker={setAttacker}
              defender={defender}
              setDefender={setDefender}
              move={move}
              x={Math.floor(index / dimension)}
              y={index % dimension}
              key={uuidv4()}
              className="tile"
              index={index}
              number={randomNumbers[index]}
            />
          )
        ))}
      </BoardStyled>
      <ErrorMessage className={error ? 'show' : ''}>
        {' '}
        &nbsp;
        {error || ''}
&nbsp;
        {' '}
      </ErrorMessage>
      <div
        style={{
          color: `${turn.length < 1 ? 'white' : userList.filter((e) => e.id === turn)[0].color}`,
          textShadow: '2px 2px 2px black',
          fontSize: '1.5em',
        }}
      >
        It's&nbsp;
        {turn.length < 1 ? 'Nobody' : userList.filter((e) => e.id === turn)[0].name}
        's turn
      </div>
    </BoardContainer>
  );
}

export default Board;
