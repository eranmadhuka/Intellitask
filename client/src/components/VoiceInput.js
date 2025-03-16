import { useState } from 'react';

export const VoiceInput = ({ onInput }) => {
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onInput(transcript);
            setIsListening(false);
        };
        recognition.start();
        setIsListening(true);
    };

    return (
        <button onClick={startListening} disabled={isListening}>
            {isListening ? "Listening..." : "Start Voice Input"}
        </button>
    );
};