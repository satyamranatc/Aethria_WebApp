import React,{ useState, useEffect} from 'react'
import axios from 'axios'

export default function Practise() {
  let Questions = [
    {
      q:"WAP to Add Two Numbers",
      hint:"make a function, acceept two numbers and return their sum",
    },
    {
      q:"WAP to print the sum of 1 to 10",
      hint:"make a function",
    },
    {
      q: "WAP to print the table of 1 to 10",
      hint: "make a function, accept a number and print the table of that number",
    }
  ]

async function solveInVsCode(question) {
  try {
    const response = await axios.post("http://localhost:5500/upload-code", question);
    if (response.status === 200) {
      alert("Sent to VS Code!");
    }
  } catch (error) {
    alert("Error sending to VS Code: " + (error.message || "Unknown error"));
  }
}

  return (
    // Tailwind
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Practise</h1>
      <div className="flex flex-wrap justify-center gap-4">
        {Questions.map((question, index) => (
          <div className='bg-white p-6 rounded-xl shadow-lg w-full max-w-sm' key = {index}>
            <h2 className="text-lg font-semibold mb-2">{question.q}</h2>
            <p className="text-gray-600">{question.hint}</p>
            <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={()=>solveInVsCode(question)} >Solve in Vs Code</button>
          </div>
          
      ))}
      </div>
    </div>
  )
}
