
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Language = "en" | "hi" | "mr";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const translations = {
  en: {
    title: "CivicEase Assistant",
    subtitle: "How can I help you today?",
    placeholder: "Type your question...",
    welcome:
      "Hello! I can help you understand government schemes and public services. What would you like to know?",
    suggestionsTitle: "SUGGESTED QUESTIONS",
    suggestions: [
      "Am I eligible for this scheme?",
      "How do I apply for this scheme?",
      "What documents will I need?",
      "How do I get a driving licence?",
    ],
    send: "Send",
    listening: "Listening... Speak now",
    voiceError: "Voice input is not supported in this browser.",
    error: "Sorry, I couldn't connect right now. Please try again.",
    language: "Language",
    thinking: "Thinking...",
  },
  hi: {
    title: "CivicEase सहायक",
    subtitle: "आज मैं आपकी कैसे मदद कर सकता हूँ?",
    placeholder: "अपना सवाल लिखें...",
    welcome:
      "नमस्ते! मैं सरकारी योजनाओं और सार्वजनिक सेवाओं को समझने में आपकी मदद कर सकता हूँ। आप क्या जानना चाहते हैं?",
    suggestionsTitle: "सुझाए गए सवाल",
    suggestions: [
      "क्या मैं इस योजना के लिए पात्र हूँ?",
      "इस योजना के लिए आवेदन कैसे करें?",
      "कौन से दस्तावेज़ चाहिए?",
      "ड्राइविंग लाइसेंस कैसे बनवाएँ?",
    ],
    send: "भेजें",
    listening: "सुन रहा हूँ... अब बोलें",
    voiceError: "इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।",
    error: "अभी कनेक्ट नहीं हो पाया। कृपया दोबारा कोशिश करें।",
    language: "भाषा",
    thinking: "जवाब तैयार हो रहा है...",
  },
  mr: {
    title: "CivicEase सहाय्यक",
    subtitle: "आज मी तुमची कशी मदत करू शकतो?",
    placeholder: "तुमचा प्रश्न लिहा...",
    welcome:
      "नमस्कार! मी तुम्हाला सरकारी योजना आणि सार्वजनिक सेवांची माहिती समजून घेण्यास मदत करू शकतो. तुम्हाला काय जाणून घ्यायचे आहे?",
    suggestionsTitle: "सुचवलेले प्रश्न",
    suggestions: [
      "मी या योजनेसाठी पात्र आहे का?",
      "या योजनेसाठी अर्ज कसा करायचा?",
      "कोणती कागदपत्रे लागतील?",
      "ड्रायव्हिंग लायसन्स कसे मिळवायचे?",
    ],
    send: "पाठवा",
    listening: "ऐकत आहे... आता बोला",
    voiceError: "या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही.",
    error: "सध्या कनेक्ट होता आले नाही. कृपया पुन्हा प्रयत्न करा.",
    language: "भाषा",
    thinking: "उत्तर तयार होत आहे...",
  },
};

function getPageLanguage(): Language {
  if (typeof document === "undefined") return "en";

  const lang = document.documentElement.lang.toLowerCase();

  if (lang.startsWith("mr")) return "mr";
  if (lang.startsWith("hi")) return "hi";

  return "en";
}

export default function ChatbotWidget() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const recognition = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Follow the language set on the current page.
  useEffect(() => {
    const updateLanguage = () => setLanguage(getPageLanguage());

    updateLanguage();

    const observer = new MutationObserver(updateLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    return () => recognition.current?.abort?.();
  }, []);

  async function sendMessage(text = input) {
    const question = text.trim();

    if (!question || loading) return;

    const previousMessages = messages;
    const updatedMessages: Message[] = [
      ...previousMessages,
      { role: "user", content: question },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          language,
          page: window.location.pathname,
          history: previousMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API returned ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply ?? data.response;

      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("No text reply returned by the chat API");
      }

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("CivicEase chatbot error:", error);

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: t.error },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      window.alert(t.voiceError);
      return;
    }

    recognition.current?.abort?.();

    const speech = new SpeechRecognitionAPI();

    speech.lang =
      language === "hi"
        ? "hi-IN"
        : language === "mr"
          ? "mr-IN"
          : "en-IN";

    speech.interimResults = false;
    speech.maxAlternatives = 1;

    speech.onstart = () => setListening(true);

    speech.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      setInput((previous) =>
        previous ? `${previous} ${transcript}` : transcript
      );
    };

    speech.onerror = () => setListening(false);
    speech.onend = () => setListening(false);

    recognition.current = speech;

    try {
      speech.start();
    } catch (error) {
      console.error("Voice recognition error:", error);
      setListening(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Chat window */}
      {open && (
        <section
          aria-label={t.title}
          style={{
            position: "fixed",
            right: "24px",
            bottom: "100px",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: "min(390px, calc(100vw - 32px))",
            height: "min(560px, calc(100dvh - 120px))",
            background: "#FFFAF5",
            color: "#48243B",
            border: "1px solid #E8D8E1",
            borderRadius: "18px",
            boxShadow: "0 12px 40px rgba(72, 36, 59, 0.16)",
            fontFamily: "inherit",
            fontSize: "14px",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              padding: "16px",
              background: "#F5EAE4",
              borderBottom: "1px solid #E8D8E1",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#48243B",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                {t.title}
              </h2>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#80576E",
                  fontSize: "12px",
                }}
              >
                {t.subtitle}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <label
                htmlFor="civicease-chat-language"
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clipPath: "inset(50%)",
                }}
              >
                {t.language}
              </label>

              <select
                id="civicease-chat-language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
                style={{
                  maxWidth: "105px",
                  padding: "7px",
                  border: "1px solid #DCC6D3",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  color: "#48243B",
                  fontSize: "12px",
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
                style={{
                  width: "30px",
                  height: "30px",
                  border: "1px solid #E8D8E1",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  color: "#632D4D",
                  fontSize: "19px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          </header>

          {/* Messages and suggestions */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "16px",
              background: "#FFFAF5",
              color: "#48243B",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
                marginRight: "16px",
                padding: "12px 14px",
                border: "1px solid #F0E4E9",
                borderRadius: "4px 14px 14px 14px",
                background: "#FFFFFF",
                color: "#48243B",
                lineHeight: 1.6,
              }}
            >
              {t.welcome}
            </div>

            {messages.length === 0 && (
              <div>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#80576E",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.7px",
                  }}
                >
                  {t.suggestionsTitle}
                </p>

                {t.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={loading}
                    onClick={() => sendMessage(suggestion)}
                    style={{
                      display: "block",
                      width: "100%",
                      marginBottom: "9px",
                      padding: "11px 13px",
                      border: "1px solid #E6CCD9",
                      borderRadius: "11px",
                      background: "#FFFFFF",
                      color: "#632D4D",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      textAlign: "left",
                      lineHeight: 1.5,
                      cursor: "pointer",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                style={{
                  maxWidth: "88%",
                  width: "fit-content",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  marginBottom: "12px",
                  marginLeft:
                    message.role === "user" ? "auto" : "0",
                  marginRight:
                    message.role === "assistant" ? "auto" : "0",
                  padding: "11px 14px",
                  border:
                    message.role === "user"
                      ? "none"
                      : "1px solid #F0E4E9",
                  borderRadius:
                    message.role === "user"
                      ? "14px 4px 14px 14px"
                      : "4px 14px 14px 14px",
                  background:
                    message.role === "user" ? "#632D4D" : "#FFFFFF",
                  color:
                    message.role === "user" ? "#FFFFFF" : "#48243B",
                  lineHeight: 1.6,
                }}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <p style={{ color: "#80576E", fontSize: "13px" }}>
                {t.thinking}
              </p>
            )}

            <div ref={endRef} />
          </div>

          {/* Voice status */}
          {listening && (
            <p
              style={{
                margin: 0,
                padding: "9px 14px",
                background: "#F5EAE4",
                color: "#632D4D",
                fontSize: "12px",
              }}
            >
              {t.listening}
            </p>
          )}

          {/* Input area */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "12px",
              borderTop: "1px solid #E8D8E1",
              background: "#FFFFFF",
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "11px 13px",
                border: "1px solid #DCC6D3",
                borderRadius: "22px",
                background: "#FFFAF5",
                color: "#48243B",
                fontFamily: "inherit",
                fontSize: "13px",
                outlineColor: "#80576E",
              }}
            />

            <button
              type="button"
              onClick={startVoiceInput}
              aria-label="Speak your question"
              title="Speak your question"
              style={{
                display: "flex",
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                padding: 0,
                border: "1px solid #E6CCD9",
                borderRadius: "50%",
                background: "#F5EAE4",
                color: "#632D4D",
                cursor: "pointer",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                flexShrink: 0,
                padding: "11px 13px",
                border: "none",
                borderRadius: "22px",
                background: "#632D4D",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: 600,
                cursor: loading || !input.trim() ? "default" : "pointer",
                opacity: loading || !input.trim() ? 0.55 : 1,
              }}
            >
              {t.send}
            </button>
          </form>
        </section>
      )}

      {/* Borderless circular chatbot icon */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={open ? "Close CivicEase chatbot" : "Open CivicEase chatbot"}
        aria-expanded={open}
        title="CivicEase Assistant"
        style={{
          position: "fixed",
          right: "40px",
          bottom: "80px",
          zIndex: 9999,
          display: "block",
          width: "64px",
          height: "64px",
          padding: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          boxShadow: "none",
          borderRadius: "50%",
          overflow: "hidden",
          cursor: "pointer",
          appearance: "none",
        }}
      >
        <img
          src="/chatbot-icon.png"
          alt=""
          width={64}
          height={64}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            padding: 0,
            border: "none",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </button>
    </>,
    document.body
  );
}
