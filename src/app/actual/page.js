"use client";
// Using 'use client' is unnecessary in Next.js since the framework already optimizes rendering on the server or client as needed.
import { Slider } from "@nextui-org/slider";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const months = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const generateGrid = () => {
  const grid = Array(10).fill(null).map(() => Array(10).fill(''));

  // Function to place a word in the grid
  const placeWordInGrid = (word) => {
    const direction = Math.random() < 0.5 ? 'HORIZONTAL' : 'VERTICAL';
    let row, col;

    if (direction === 'HORIZONTAL') {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * (10 - word.length));
    } else {
      row = Math.floor(Math.random() * (10 - word.length));
      col = Math.floor(Math.random() * 10);
    }

    for (let i = 0; i < word.length; i++) {
      if (direction === 'HORIZONTAL') {
        grid[row][col + i] = word[i];
      } else {
        grid[row + i][col] = word[i];
      }
    }
  };

  // Place each month in the grid
  months.forEach(month => placeWordInGrid(month));

  // Fill the empty spaces with random letters
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random A-Z
      }
    }
  }

  return grid;
};

const WordSearch = ({ onMonthSelect }) => {
  const [grid] = useState(generateGrid());
  const [selectedCells, setSelectedCells] = useState([]);

  const handleCellClick = (row, col) => {
    setSelectedCells([...selectedCells, { row, col }]);
  };

  const checkSelectedWord = () => {
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    if (months.includes(selectedWord)) {
      onMonthSelect(selectedWord);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-10 gap-1 text-black">
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-10 h-10 flex items-center justify-center border ${selectedCells.some(c => c.row === rowIndex && c.col === colIndex) ? 'bg-green-300' : 'bg-white'}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        ))}
      </div>
      <button className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-gray-500 w-full" onClick={checkSelectedWord}>Submit Month</button>
    </div>
  );
};

const AutoSlider = ({ value, onChange }) => {
  const [direction, setDirection] = useState(1); // 1 for increasing, -1 for decreasing
  const [isRunning, setIsRunning] = useState(true); // State to manage whether the slider is running
  const intervalRef = useRef(null); // To keep track of the interval

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        onChange(prevValue => {
          // Determine new value based on current direction
          const newValue = prevValue + direction * 0.05; // Control speed

          // Reverse direction if boundaries are exceeded
          if (newValue >= 2024 || newValue <= 1900) {
            setDirection(-direction);
            return newValue >= 2024 ? 2024 : 1900; // Ensure value stays within bounds
          }

          return newValue;
        });
      }, 5); // Adjust time to control speed
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    

    // Cleanup interval on component unmount
    return () => clearInterval(intervalRef.current);
  }, [direction, isRunning, onChange]);

  const handleToggle = () => {
   setIsRunning(!isRunning); // Toggle the running state
  }

  return (
    <div>
      <Slider 
        label="Birthyear" 
        id="birthyear"
        step={1} 
        maxValue={2024} 
        minValue={1900} 
        value={value} // Use state-managed value here
        className="max-w-md"
        onChange={onChange} // Call the passed-in onChange function
      />
      <button type="button" className="bg-red-500 text-white rounded-md my-2 p-2 hover:bg-gray-500 w-full" onClick={handleToggle}
      >
        {isRunning ? 'Stop' : 'Start'} Slider</button>
    </div>
  );
};


export default function Actual() {
  const [birthday, setBirthday] = useState('');
  const [birthmonth, setBirthmonth] = useState('');
  const [birthyear, setBirthyear] = useState(2024); // Default value for the AutoSlider
  const [submitted, setSubmitted] = useState(false); // State to track if the form has been submitted
  const [submittedValues, setSubmittedValues] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmittedValues({ birthday, birthmonth, birthyear: Math.round(birthyear) });
    setSubmitted(true); // Set submitted to true to indicate form submission
  };

  return (
    <>
      <h1 className="text-5xl font-bold text-center mt-32 mb-16">Haha, you thought that was the actual interface?</h1>
      <form className="flex flex-col justify-center items-center" onSubmit={handleSubmit}>
        <div className="flex flex-col items-left">
          <label className="text-4xl font-bold" htmlFor="birthday">Enter your birthday</label>
          <input
            type="text"
            id="birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="mt-4 mb-4 p-2 text-black border border-gray-300 rounded"
          />
          <label className="text-4xl font-bold mt-16" htmlFor="birthmonth">Enter your birthmonth</label>
          <WordSearch onMonthSelect={setBirthmonth} />
          <label className="text-4xl font-bold mt-16" htmlFor="birthyear">Enter your birthyear</label>
          <AutoSlider value={birthyear} onChange={setBirthyear} />
          <button className="bg-blue-500 text-white rounded-md mt-2 mb-16 p-2 hover:bg-gray-500 w-full" type="submit">Submit Year</button>
        </div>
      </form>
      {submitted && (
        <div className="flex flex-col justify-center items-center mb-64">
          <div className="mt-8 flex flex-col items-left">
            <h2 className="text-4xl font-bold">Submitted Information</h2>
            <p className="text-2xl">Birthday: {submittedValues.birthday}</p>
            <p className="text-2xl">Birthmonth: {submittedValues.birthmonth}</p>
            <p className="text-2xl">Birthyear: {submittedValues.birthyear}</p>
          </div>
        </div>
      )}
    </>
  );
}