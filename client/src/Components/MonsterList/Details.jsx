import React, { useState } from 'react';
import styled from 'styled-components';
import sampleArray from './../../exampleData/data';

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #131516;
  width: 100%;
  height: 100%;
  z-index: 5;
  border-radius: 5px;
`;

const TopContainer = styled.div`
  display: flex;
  margin: 15px;
  font-family: 'Macondo', cursive !important;
`;

const IconContainer = styled.img`
  width: 33%;
  height: auto;
  display: flex;
  overflow: hidden;
  border-width: 2px;
  border-style: solid;
  border-image: linear-gradient(to right, #1b67ff, #ffffff) 1;
`;

const MonsterName = styled.div`
  display: flex;
  width: 100%;
  background-image: linear-gradient(to right, rgba(255,0,0,0), #3e497a34);
  border-radius: 5px;
  font-size: x-large;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  text-align: center;
  color: #8a0303;
`;

const Description = styled.div`
  display: flex;
  width: 99%
  font-size: large;
  justify-content: center;
  align-items: center;
  // border: solid 1px;
  text-transform: uppercase;
  font-style: italic;
  color: #8a0303;
`;

const StatsContainer = styled.div`
  margin: 15px;
`;

const AttacksContainer = styled.div`
  margin: 15px;
  text-transform: uppercase;
`;

const AttackTitle = styled.div`
  font-size: large;
  text-align: center;
`;

const StyledLeftTD = styled.div`
  width: 100px;
`;

const StyledAttackTable = styled.table`
  margin-left: 1em;
`;

function Details({}) {
  const [monster, setMonster] = useState(sampleArray.Zelroth[0]);

  return (
    <DetailsContainer>
      <TopContainer>
        <IconContainer src={`${monster.image}`} alt="something" />
        <MonsterName><h4>{monster.name}</h4></MonsterName>
      </TopContainer>
      <Description>{monster.description}</Description>
      <StatsContainer>
        <table>
          <tr>
            <StyledLeftTD>HEALTH: </StyledLeftTD>
            <td>{monster.currentHealth}/{monster.maxHealth} </td>
          </tr>
          <tr>
            <StyledLeftTD>ARMOR: </StyledLeftTD>
            <td>{monster.armor}</td>
          </tr>
          <tr>
            <StyledLeftTD>MOVEMENT: </StyledLeftTD>
            <td>{monster.movement}</td>
          </tr>
        </table>

        {/* <div>HEALTH: {monster.currentHealth}/{monster.maxHealth} <progress value={monster.currentHealth} max={monster.maxHealth} /> </div>
        <div>ARMOR: {monster.armor}</div>
        <div>MOVEMENT: {monster.movement}</div> */}
      </StatsContainer>
      <AttacksContainer>
        <AttackTitle>Attacks</AttackTitle>
        <hr />
        {monster.attacks.map((e) => (
          <>
            {e.attackName}
            <StyledAttackTable>
              <tr>
                <StyledLeftTD>Attack: </StyledLeftTD>
                <td>{e.attack}</td>
              </tr>
              <tr>
                <StyledLeftTD>Damage: </StyledLeftTD>
                <td>{e.damage}</td>
              </tr>
              <tr>
                <StyledLeftTD>Multiplier: </StyledLeftTD>
                <td>{e.multiplier}</td>
              </tr>
            </StyledAttackTable>
            <hr />
            {/* <div>
              Name: {e.attackName}
            </div>
            <div>
              Attack: {e.multiplier > 1 ? `(` : ''}{e.attack}{e.multiplier > 1 ? `)* ${e.multiplier}` : ''}
            </div>
            <div>
              Damage: {e.damage}
            </div> */}
          </>
        )
        )}
      </AttacksContainer>

    </DetailsContainer>
  );
}

export default Details;
