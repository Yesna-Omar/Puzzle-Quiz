import React, { useState } from 'react';
import Crossword from '@jaredreisinger/react-crossword';

export default function CrosswordTest() { 
  const [crosswordData, setCrosswordData] = useState({
    across: {},
    down: {},
  });

  const [formData, setFormData] = useState({ clue: '', answer: '', row: '', col: '' });
  const [clueIdCounter, setClueIdCounter] = useState(1);
  const [deletedClueIds, setDeletedClueIds] = useState([]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addClue = () => {
    const { clue, answer, row, col } = formData;

    if (clue.trim() === '' || answer.trim() === '' || row === '' || col === '') {
      return;
    }

    let newClueId;

    if (deletedClueIds.length > 0) {
      newClueId = deletedClueIds.shift();
    } else {
      newClueId = clueIdCounter;
      setClueIdCounter(clueIdCounter + 1);
    }

    const rowIndex = parseInt(row, 10);
    const colIndex = parseInt(col, 10);
    const direction = Math.random() < 0.5 ? 'across' : 'down';

    const existingClues = crosswordData[direction];

    for (const existingClueId in existingClues) {
      const existingClueData = existingClues[existingClueId];
      if (
        (direction === 'across' && existingClueData.row === rowIndex) ||
        (direction === 'down' && existingClueData.col === colIndex)
      ) {
        const existingAnswer = existingClueData.answer;
        const commonLetters = getCommonLetters(existingAnswer, answer);
        if (commonLetters.length > 0) {
          return;
        }
      }
    }

    for (const existingClueId in crosswordData[direction]) {
      const existingClueData = crosswordData[direction][existingClueId];
      if (direction === 'across' && existingClueData.row === rowIndex) {
        const existingColStart = existingClueData.col;
        const existingColEnd = existingColStart + existingClueData.answer.length - 1;
        if ((colIndex >= existingColStart && colIndex <= existingColEnd) ||
            (colIndex + answer.length - 1 >= existingColStart && colIndex + answer.length - 1 <= existingColEnd)) {
          return;
        }
      } else if (direction === 'down' && existingClueData.col === colIndex) {
        const existingRowStart = existingClueData.row;
        const existingRowEnd = existingRowStart + existingClueData.answer.length - 1;
        if ((rowIndex >= existingRowStart && rowIndex <= existingRowEnd) ||
            (rowIndex + answer.length - 1 >= existingRowStart && rowIndex + answer.length - 1 <= existingRowEnd)) {
          return;
        }
      }
    }

    const newCrosswordData = {
      ...crosswordData,
      [direction]: {
        ...crosswordData[direction],
        [newClueId]: {
          clue: clue,
          answer: answer.toUpperCase(),
          row: rowIndex,
          col: colIndex,
        },
      },
    };

    setCrosswordData(newCrosswordData);
    setFormData({ clue: '', answer: '', row: '', col: '' }); 
  };

  const removeClue = (direction, clueId) => {
    const updatedCrosswordData = { ...crosswordData };
    delete updatedCrosswordData[direction][clueId];
    setCrosswordData(updatedCrosswordData);
    setDeletedClueIds([...deletedClueIds, parseInt(clueId)]);
  };
   
  const getCommonLetters = (str1, str2) => {
    return str1.split('').filter(char => str2.includes(char));
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); addClue(); }}>
        <label>
          Clue:
          <input type="text" name="clue" value={formData.clue} onChange={handleFormChange} />
        </label>
        <label>
          Answer:
          <input type="text" name="answer" value={formData.answer} onChange={handleFormChange} />
        </label>
        <label>
          Row:
          <input type="number" name="row" value={formData.row} onChange={handleFormChange} />
        </label>
        <label>
          Column:
          <input type="number" name="col" value={formData.col} onChange={handleFormChange} />
        </label>
        <button type="submit">Add Clue</button>
      </form>
      <div>
        <h2>Generated Clues</h2>
        {Object.entries(crosswordData).map(([direction, clues]) => (
          <div key={direction}>
            <h3>{direction.toUpperCase()}</h3>
            <ul>
              {Object.entries(clues).map(([clueId, clueData]) => (
                <li key={clueId}>
                  {clueData.clue} - {clueData.answer} - ({clueData.row}, {clueData.col})
                  <button onClick={() => removeClue(direction, clueId)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ width: '100em', display: 'flex' }}>
        <Crossword data={crosswordData} />
      </div>
    </div>
  );
}