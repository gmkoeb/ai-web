'use client'

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [savedPrompt, setSavedPrompt] = useState('')

  async function handleSubmit(event: React.KeyboardEvent<HTMLTextAreaElement>){
    if (event.key === "Enter" && !event.shiftKey && prompt) {
      setAiResponse('')
      setPrompt('')
      setSavedPrompt(prompt)
      const promptData = {
        "model": "deepseek-r1:7b",
        "prompt": prompt
      }
      event.preventDefault()
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        buffer += decoder.decode(value, { stream: true });
      
        let boundary = buffer.indexOf('\n'); 
      
        while (boundary !== -1) {
          const completeChunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 1); 
      
          try {
            const parsedChunk = JSON.parse(completeChunk);
            setAiResponse(prevResponse => prevResponse + parsedChunk.response);
          } catch (error) {
            console.error('Error parsing chunk:', error);
          }
      
          boundary = buffer.indexOf('\n');
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center mt-40">
      <h1 className="text-center text-3xl text-gray-600 font-bold">What can i help you with?</h1>
      <textarea placeholder="Message AiWeb" 
                className="mt-10 rounded-2xl bg-neutral-100 text-gray-700 p-2 placeholder-gray-400 resize-none" 
                name="chatBot" 
                id="chatBot" 
                value={prompt}
                rows={3}
                cols={80}
                onInput={(event: React.FormEvent<HTMLTextAreaElement>) => setPrompt(event.currentTarget.value)}
                onKeyDown={handleSubmit}
              />
      {aiResponse && (
        <div className="flex flex-col items-center mt-10 w-[60%]">
          <h2 className="text-left">{savedPrompt}</h2>
          <div className="bg-neutral-100 mt-5 rounded-2xl p-6">
            <ReactMarkdown>{aiResponse}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
