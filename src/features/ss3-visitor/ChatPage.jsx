import { useState } from "react";
import Card from "../../components/common/Card.jsx";

const BOT_REPLY = "Meranti Merah is a protected native species. In this garden it is over 80 years old and reaches approximately 30 metres.";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ from: "bot", text: "Hello. Ask me about any tree or zone in Taman Botani Johor." }]);
  const send = () => {
    if (!input.trim()) return;
    setMessages((current) => [...current, { from: "user", text: input }, { from: "bot", text: BOT_REPLY }]);
    setInput("");
  };
  return (
    <Card title="TBJ Botanical AI Assistant" subtitle="Context-aware visitor learning prototype">
      <div className="chat-window">{messages.map((message, index) => <p className={`chat-bubble chat-${message.from}`} key={index}>{message.text}</p>)}</div>
      <div className="input-row"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Ask about a tree..." /><button className="button" onClick={send}>Send</button></div>
      <div className="suggestion-row">{["Tell me about Meranti Merah", "Which trees are rare?", "Where are the lakes?"].map((question) => <button key={question} onClick={() => setInput(question)}>{question}</button>)}</div>
    </Card>
  );
}

export function ChatFloatingButton({ onClick }) {
  return <button className="chat-floating" onClick={onClick} aria-label="Open botanical AI assistant">AI</button>;
}
