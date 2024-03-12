import React, { useState } from 'react';
import Crossword from '@jaredreisinger/react-crossword';

export default function CrosswordTest() {
  // function (setCrosswordData) is to update the state value. 
  const [crosswordData, setCrosswordData] = useState({
    across: {},
    down: {},
  });

  const [formData, setFormData] = useState({ clue: '', answer: '', row: '', col: '' });

  // Initialize clue ID counter and array to track deleted IDs
  const [clueIdCounter, setClueIdCounter] = useState(1);
  // When a clue is deleted, its ID is added to this array, allowing for the reuse of IDs and preventing conflicts with newly added clues.
  const [deletedClueIds, setDeletedClueIds] = useState([]);

  //  this function dynamically updates the form data as the user inputs values into the form fields, ensuring that the component's state reflects the latest user input.
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addClue = () => {
    const { clue, answer, row, col } = formData;

    // Ensure clue, answer, row, and col are not empty
    // If any of these conditions are true then the clue cannot be added to the puzzle until all required fields are filled out by the user.
    if (clue.trim() === '' || answer.trim() === '' || row === '' || col === '') {
      return;
    }

    let newClueId;

    // If there are deleted IDs, reuse the first one .Else increment the counter for new IDs. 
    if (deletedClueIds.length > 0) {
      newClueId = deletedClueIds.shift();
    } else {
      newClueId = clueIdCounter;
      setClueIdCounter(clueIdCounter + 1); // Increment the clue ID counter
    }

    // Convert row and col to integers
    const rowIndex = parseInt(row, 10);
    const colIndex = parseInt(col, 10);

    // Determine whether to add the clue to across or down
    const direction = Math.random() < 0.5 ? 'across' : 'down';

    // Check for overlapping letters in existing clues
    const existingClues = crosswordData[direction];
    for (const existingClueId in existingClues) {
      const existingClueData = existingClues[existingClueId];
      if (
        (direction === 'across' && existingClueData.row === rowIndex) ||
        (direction === 'down' && existingClueData.col === colIndex)
      ) {
        const existingAnswer = existingClueData.answer;
        const commonLetters = getCommonLetters(existingAnswer, answer);
        // If there are common letters between the existing clue's answer and the new clue's answer, it indicates an overlap. In this case,
        // the function returns early, indicating that the new clue cannot be added due to the overlap.
        if (commonLetters.length > 0) {
          return;
        }
      }
    }

    // Additional rules for position of answers
    for (const existingClueId in crosswordData[direction]) {
      const existingClueData = crosswordData[direction][existingClueId];
      if (direction === 'across' && existingClueData.row === rowIndex) {
        const existingColStart = existingClueData.col;
        const existingColEnd = existingColStart + existingClueData.answer.length - 1;
        // it indicates a potential overlap in the column direction.
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

    // Add the new clue to the crossword data with the incremented clue ID
    const newCrosswordData = {
      // This uses the spread operator (...) to create a shallow copy of the crosswordData object.
      // This ensures that we don't directly mutate the original state.
      ...crosswordData,
      [direction]: {
        // This updates the property corresponding to the specified direction ('across' or 'down') in the newCrosswordData object. 
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
    setFormData({ clue: '', answer: '', row: '', col: '' }); // Clear the form fields after adding clue
  };

  const removeClue = (direction, clueId) => {
    // Remove the clue from the crossword data
    const updatedCrosswordData = { ...crosswordData };
    delete updatedCrosswordData[direction][clueId];
    setCrosswordData(updatedCrosswordData);

    // Add the deleted ID to the array of deleted IDs
    setDeletedClueIds([...deletedClueIds, parseInt(clueId)]);
  };
   
  // To Check if str1 has common letters with str2
  const getCommonLetters = (str1, str2) => {
    return str1.split('').filter(char => str2.includes(char));
  };

  return (
    <div>
     {/* (preventDefault()) This line prevents the default form submission behavior, which would cause the page to reload. Instead, it stops the default behavior so that custom logic can be executed without reloading the page. */}
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