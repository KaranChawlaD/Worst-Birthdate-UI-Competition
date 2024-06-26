"use client";
import { Slider } from "@nextui-org/react";
import { useState, useEffect, useRef } from 'react';
import { evaluate } from 'mathjs'

const equations = [
  "(3 * 7) + 1", "(2 * 2) - (6 / 2)", "(3^2) * 2", "10 / 2 - (2 / 2)",
  "(4^2)", "((2^2) * 2) - 2", "(3 * 3) - 3", "(4 * 6)", "(8 / 4) + (6 / 3)",
  "(3 * 4) / 1", "(2^2)", "(2^3)", "(24 - 1)", "(5 * 4) - 1",
  "(2 * 7)", "(4 * 5)", "(15 - 5 + 3)", "(3 * 5)", "(30 - 1)", "(3^2) - 2",
  "((2^2) * 2) - 2", "(10 / 2) + (4 / 2)", "3^3", "20 + (4 / 4)", "(5 * 6)",
  "(4 * 6)", "(5^2)", "(4 * 5)", "(5 * 6) + 1", "(5^2) - 8", "(3 - 2) * 1"
];

const evaluateExpression = (expression) => {
  try {
    expression = expression.replace(/\^/g, '**');
    const func = new Function('return ' + expression);
    return func();
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return null;
  }
};

const BirthdayGrid = ({ onSelect }) => {
  const [selectedEquation, setSelectedEquation] = useState('');

  const getButtonLabel = (equation) => {
    return evaluateExpression(equation);
  };

  const handleButtonClick = (equation) => {
    const result = getButtonLabel(equation);
    setSelectedEquation(equation);
    onSelect(result);
  };

  return (
    <div className="grid grid-cols-6 gap-2 text-black">
      {equations.map((equation, index) => (
        <button
          key={index}
          className={`w-20 h-20 flex items-center justify-center border border-gray-300 hover:bg-gray-200 ${selectedEquation === equation ? 'bg-green-300' : 'bg-white'}`}
          onClick={() => handleButtonClick(equation)}
        >
          {equation}
        </button>
      ))}
    </div>
  );
};

const months = [
  "DECEMBER", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER"
];

const generateGrid = () => {
  const grid = Array(12).fill(null).map(() => Array(12).fill(''));

  // Function to place a word in the grid
  const placeWordInGrid = (word) => {
    const direction = Math.random() < 0.5 ? 'HORIZONTAL' : 'VERTICAL';
    let row, col;

    for (let i = 0; i < 20; i++) {
      let notFilled = true;
      if (direction === 'HORIZONTAL') {
        row = Math.floor(Math.random() * 12);
        col = Math.floor(Math.random() * (12 - word.length));
        for (let j = 0; j < word.length; j++) {
          if (grid[row][col+j] != '') {
            notFilled = false;
            break;
          }
        }
        if (notFilled == true) {
          break;
        }
      } else {
        row = Math.floor(Math.random() * (12 - word.length));
        col = Math.floor(Math.random() * 12);
        for (let j = 0; j < word.length; j++) {
          if (grid[row+j][col] != '') {
            notFilled = false;
            break;
          }
        }
        if (notFilled == true) {
          break;
        }
      }
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
  const [grid, setGrid] = useState(generateGrid());
  const [selectedCells, setSelectedCells] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid(generateGrid());
      setSelectedCells([]);
    }, 7000);

    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  const handleCellClick = (row, col) => {
    setSelectedCells([...selectedCells, { row, col }]);
  };

  const checkSelectedWord = () => {
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    if (months.includes(selectedWord)) {
      clearInterval(intervalRef.current);
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
      // ctx.beginPath();
      // ctx.rect(submitX, submitY, 70, 20);
      // ctx.fillStyle = '#000000'; 
      // ctx.fill();
      // ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
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
      <canvas ref={canvasRef} width="480" height="640" style={{ border: '3px solid white' }} />
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
        <div className="flex flex-col items-left mb-16">
          <label className="text-4xl font-bold" htmlFor="birthday">Enter your birthday</label>
          {/* <input
            type="text"
            id="birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="mt-4 mb-4 p-2 text-black border border-gray-300 rounded"
          /> */}
          <BirthdayGrid onSelect={(value) => setBirthday(value)} />
          <label className="text-4xl font-bold mt-16" htmlFor="birthmonth">Enter your birthmonth</label>
          <WordSearch onMonthSelect={setBirthmonth} />
          <label className="text-4xl font-bold mt-16" htmlFor="birthyear">Enter your birthyear</label>
          <AutoSlider value={birthyear} onChange={setBirthyear} />
        </div>
        <PongGame onSubmit={handleSubmit} />
      </div>
      {submitted && (
        <div className="flex flex-col justify-center items-center mb-16">
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
