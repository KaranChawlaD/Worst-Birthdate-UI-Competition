"use client";
// Using 'use client' is unnecessary in Next.js since the framework already optimizes rendering on the server or client as needed.
import { Slider } from "@nextui-org/react";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
      }, 2.5); // Adjust time to control speed
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
        minValue={1900}
        value={value}
        className="max-w-md"
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
            className="mt-4 mb-4 p-2 border border-gray-300 rounded"
          />
          <label className="text-4xl font-bold mt-16" htmlFor="birthmonth">Enter your birthmonth</label>
          <input
            type="text"
            id="birthmonth"
            value={birthmonth}
            onChange={(e) => setBirthmonth(e.target.value)}
            className="mt-4 mb-4 p-2 border border-gray-300 rounded"
          />
          <label className="text-4xl font-bold mt-16" htmlFor="birthyear">Enter your birthyear</label>
          <AutoSlider value={birthyear} onChange={setBirthyear} />
          <button className="bg-blue-500 text-white rounded-md my-16 p-2 hover:bg-gray-500 w-full" type="submit">Submit</button>
        </div>
      </form>
      {submitted && (
        <div className="flex flex-col items-center mb-64">
          <div className="mt-8 text-left">
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