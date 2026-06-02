import { useEffect, useState } from "react";
import Card from "../../components/common/Card.jsx";
import { visitorText } from "../../services/visitorI18n.js";

export default function ChatPage({ language }) {
  const t = (path) => visitorText(language, path);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ from: "bot", text: t("chat.hello") }]);
  useEffect(() => setMessages([{ from: "bot", text: t("chat.hello") }]), [language]);
  const send = () => {
    if (!input.trim()) return;
    setMessages((current) => [...current, { from: "user", text: input }, { from: "bot", text: t("chat.meranti") }]);
    setInput("");
  };
  return (
    <Card title={t("chat.title")} subtitle={t("chat.subtitle")}>
      <div className="chat-window">{messages.map((message, index) => <p className={`chat-bubble chat-${message.from}`} key={index}>{message.text}</p>)}</div>
      <div className="input-row"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder={t("chat.placeholder")} /><button className="button" onClick={send}>{t("chat.send")}</button></div>
      <div className="suggestion-row">{t("chat.suggestions").map((question) => <button key={question} onClick={() => setInput(question)}>{question}</button>)}</div>
    </Card>
  );
}

export function ChatFloatingButton({ onClick }) {
  return <button className="chat-floating" onClick={onClick} aria-label="Open botanical AI assistant">AI</button>;
}
