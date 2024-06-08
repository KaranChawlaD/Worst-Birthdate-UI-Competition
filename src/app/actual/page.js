"use client";
import { Slider } from "@nextui-org/react";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const months = [
  "SEPTEMBER", "DECEMBER", "NOVEMBER", "FEBRUARY","JANUARY", "OCTOBER", "AUGUST", "MARCH", "APRIL", "JUNE",
  "JULY", "MAY"
];

const generateGrid = () => {
  let grid = Array(12).fill(null).map(() => Array(12).fill(''));

  const placeWordInGrid = (word) => {
    let filled = true;

    for (let i = 0; i < 250 && filled == true; i++) {  
      let direction = '';
      let curRow = 0;
      let curCol = 0;
      let directionNum = Math.random();
      if (directionNum <= 0.25) {
        direction = 'HORIZONTAL';
      } else if (directionNum <= 0.5) {
        direction = 'VERTICAL';
      } else if (directionNum <= 0.75) {
        direction = 'DIAGONAL1';
      } else {
        direction = 'DIAGONAL2';
      }

      let row = Math.floor(Math.random() * 12);
      let col = Math.floor(Math.random() * 12);

      // Adjust starting positions based on the direction
      if (direction === 'HORIZONTAL' && col + word.length > 12) col = Math.floor(Math.random() * (12 - word.length));
      if (direction === 'VERTICAL' && row + word.length > 12) row = Math.floor(Math.random() * (12 - word.length));
      if (direction === 'DIAGONAL1' && (col + word.length > 12 || row + word.length > 12)) {
        col = Math.floor(Math.random() * (12 - word.length));
        row = Math.floor(Math.random() * (12 - word.length));
      }
      if (direction === 'DIAGONAL2' && (col + word.length > 12 || row - word.length < 0)) {
        col = Math.floor(Math.random() * (12 - word.length));
        row = word.length - 1;
      }

      for (let j = 0; j < word.length; j++) {
        curRow = (direction === 'VERTICAL' || direction === 'DIAGONAL1') ? row + j : row;
        curCol = (direction === 'HORIZONTAL' || direction === 'DIAGONAL1') ? col + j : col;
        if (direction === 'DIAGONAL2') {
          curRow = row - j;
          curCol = col + j;
        }

        if (grid[curRow][curCol] === '' || grid[curRow][curCol] === word[j]) {
          filled = false;
        }
        else {
          filled = true;
          break;
        }
      }

      if (filled == false) {
        for (let j = 0; j < word.length; j++) {
          grid[row + ((direction === 'VERTICAL' || direction === 'DIAGONAL1') ? j : 0)][col + ((direction === 'HORIZONTAL' || direction === 'DIAGONAL1') ? j : (direction === 'DIAGONAL2' ? j : 0))] = word[j];
          if (direction === 'DIAGONAL2') grid[row - j][col + j] = word[j];
        }
      }
    }
  };

  // Place each month in the grid
  months.forEach(month => placeWordInGrid(month));

  // Fill the empty spaces with random letters
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
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

  useEffect(() => {
    checkSelectedWord();
  }, [selectedCells]);

  return (
    <div>
      <div className="grid grid-cols-12 gap-1 text-black">
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
          if (newValue >= 2024 || newValue <= 0) {
            setDirection(-direction);
            return newValue >= 2024 ? 2024 : 0; // Ensure value stays within bounds
          }

          return newValue;
        });
      }, ); // Adjust time to control speed
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
      <style jsx>{`
        .no-pointer-events {
          pointer-events: none;
        }
      `}</style>
      <Slider 
        label="Birthyear"
        step={1}
        maxValue={2024}
        minValue={0}
        value={value}
        className="w-full"
        onChange={onChange}
        style={{ pointerEvents: 'none' }}
      />
      <button 
        type="button" 
        className="bg-red-500 text-white rounded-md my-2 p-2 hover:bg-gray-500 w-full" 
        onClick={handleToggle}
      >
        {isRunning ? 'Stop' : 'Start'} Slider
      </button>
    </div>
  );
};

const PongGame = ({ onSubmit }) => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const paddleHeight = 10, paddleWidth = 75, ballRadius = 10;

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let dx = 2;
    let dy = -2;
    let paddleX = (canvas.width - paddleWidth) / 2;
    let rightPressed = false;
    let leftPressed = false;
    const submitX = canvas.width / 2 - 30;
    const submitY = 10;

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.closePath();
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.closePath();
    };

    const drawSubmitTarget = () => {
      ctx.beginPath();
      ctx.rect(submitX, submitY, 70, 20);
      ctx.fillStyle = '#90EE90';
      ctx.fill();
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText('SUBMIT', submitX + 5, submitY + 15);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBall();
      drawPaddle();
      drawSubmitTarget();

      if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
      }
      if (ballY + dy < ballRadius) {
        dy = -dy;
      } else if (ballY + dy > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
          dy = -dy;
        } else {
          document.location.reload();
        }
      }

      if (
        ballX > submitX &&
        ballX < submitX + 60 &&
        ballY + dy > submitY &&
        ballY + dy < submitY + 20
      ) {
        dx=0;
        dy=0;
        onSubmit();
      }

      ballX += dx;
      ballY += dy;

      if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
      }

      requestAnimationFrame(draw);
    };

    const keyDownHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
      }
    };

    const keyUpHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    draw();

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    };
  }, [gameStarted]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width="480" height="320" style={{ border: '1px solid #000' }} />
      {!gameStarted && (
        <button
          className="bg-blue-500 text-white rounded-md mt-2 p-2 hover:bg-gray-500"
          onClick={() => setGameStarted(true)}
        >
          Start Game To Submit
        </button>
      )}
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
    setSubmittedValues({ birthday, birthmonth, birthyear: Math.round(birthyear) });
    setSubmitted(true); // Set submitted to true to indicate form submission
  };

  return (
    <>
      <h1 className="text-5xl font-bold text-center mt-32 mb-16">Haha, you thought that was the actual interface?</h1>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-left mb-64">
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
        </div>
        <PongGame onSubmit={handleSubmit} />
      </div>
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
