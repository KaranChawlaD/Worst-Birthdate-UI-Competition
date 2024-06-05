'use client';
import Image from "next/image";
// pages/index.js

export default function Home() {
  return (
    <div>
      <h1 className="text-5xl font-bold text-center mt-64 mb-32">Enter your Birthdate</h1>
      <form className="flex flex-col items-center justify-center" action="/actual/" method="post">
        <div className="flex flex-col items-left">
          <label className="text-xl my-2" for="birthdate">Birthdate:</label>
          <input
            className="w-64 text-black"
            type="date"
            id="birthdate"
            required
          />
          <button className="bg-blue-500 text-white rounded-md my-2 p-2 hover:bg-gray-500 w-64" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}