import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = process.env.GEMINI_API_KEY; // Use environment variable

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(API_KEY);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Ensure model is correct

      const chat = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: input }] }],
      });

      const response = chat.response;
      const responseText = response.candidates[0]?.content?.parts[0]?.text || "No response from Gemini AI.";

      setMessages([...newMessages, { sender: "bot", text: responseText }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages([...newMessages, { sender: "bot", text: "Error fetching response from Gemini." }]);
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chat with Gemini AI</h1>
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <strong>{msg.sender === "user" ? "You" : "Gemini"}:</strong> {msg.text}
              </div>
            ))}
          </div>
          {loading && <p>Thinking...</p>}
          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "Loading..." : "Send"}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;