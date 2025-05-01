import React, { useState, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaRobot } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

const SmartPrioritization = ({ onAddTask }) => {
    const [isListening, setIsListening] = useState(false);
    const [voiceCommandText, setVoiceCommandText] = useState("");
    const [nlpAnalysis, setNlpAnalysis] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showNlpDetails, setShowNlpDetails] = useState(false);
    const [lastSubmitTime, setLastSubmitTime] = useState(0);
    const [error, setError] = useState("");

    const THROTTLE_TIMEOUT = 2000;

    const { currentUser, loading } = useAuth();
    const [task, setTask] = useState({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        category: "General",
    });

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionRef = React.useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.lang = "en-US";
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join(" ");
                setVoiceCommandText(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, []);

    const validateInput = (text) => {
        // Initialize validation result
        const result = {
            isValid: true,
            errors: []
        };

        // Check if input is empty
        if (!text || text.trim() === "") {
            result.isValid = false;
            result.errors.push("Please enter a task description or use voice input");
            return result;
        }

        // Check minimum length (a reasonable task description should be at least a few characters)
        if (text.trim().length < 5) {
            result.isValid = false;
            result.errors.push("Task description is too short");
        }

        // Check maximum length (prevent extremely long inputs that could cause issues)
        if (text.trim().length > 500) {
            result.isValid = false;
            result.errors.push("Task description is too long (maximum 500 characters)");
        }

        // Check for potential injection or malicious content
        const suspiciousPatterns = [/<script>/i, /javascript:/i, /<iframe>/i];
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(text)) {
                result.isValid = false;
                result.errors.push("Input contains potentially unsafe content");
                break;
            }
        }

        // Optional: Check for basic task structure (should contain a verb or action word)
        const commonTaskVerbs = ['remind', 'call', 'email', 'meet', 'review', 'create', 'finish', 'complete', 'send', 'prepare', 'schedule'];
        const hasActionWord = commonTaskVerbs.some(verb => text.toLowerCase().includes(verb));

        if (!hasActionWord) {
            // This is just a warning, not an error that prevents submission
            result.warnings = ["Your task may be missing an action word (like 'call', 'email', 'review', etc.)"];
        }

        return result;
    };

    const startListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const processVoiceCommand = async (text) => {
        if (!text || !currentUser?.token) return;

        // Check throttling
        const now = Date.now();
        if (now - lastSubmitTime < THROTTLE_TIMEOUT) {
            setError(`Please wait ${Math.ceil((THROTTLE_TIMEOUT - (now - lastSubmitTime)) / 1000)} seconds before submitting again`);
            return;
        }

        // Validate the input before processing
        const validationResult = validateInput(text);

        // If validation fails, display errors and return
        if (!validationResult.isValid) {
            setError(validationResult.errors.join(". "));
            return;
        }

        // If there are warnings, you might want to display them but still proceed
        if (validationResult.warnings) {
            // Optionally show warnings to the user as a less severe notification
            console.log("Warnings:", validationResult.warnings);
        }

        setIsProcessing(true);
        setError(""); // Clear any previous errors

        try {
            const response = await axios.post(
                `${API_URL}/api/tasks/process-input`,
                { inputText: text },
                { headers: { Authorization: `Bearer ${currentUser.token}` } }
            );

            setNlpAnalysis(response.data.nlpAnalysis);

            setTask({
                title: response.data.task.title || "",
                description: response.data.task.description || "",
                priority: response.data.task.priority || "Medium",
                dueDate: response.data.task.dueDate ? new Date(response.data.task.dueDate).toISOString().split('T')[0] : "",
                category: response.data.task.category || "General"
            });

            setShowNlpDetails(true);

            if (typeof onAddTask === "function") {
                onAddTask(response.data);
                alert("Task created successfully with smart prioritization!");
            }

            // Update the last submit time on successful submission
            setLastSubmitTime(now);

        } catch (error) {
            console.error("Error processing voice command:", error);
            setError(error.response?.data?.message || "Failed to process voice command. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* Voice Command Section */}
            <div className="w-full">
                <div className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300 flex items-center">
                        <FaRobot className="mr-2" /> Voice/Text Smart Processing
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Speak or type your task naturally. Our AI will automatically detect priorities, deadlines, and categories.
                    </p>

                    <div className="relative">
                        <textarea
                            value={voiceCommandText}
                            onChange={(e) => setVoiceCommandText(e.target.value)}
                            placeholder="Example: 'Remind me to call John tomorrow at 2 PM' or 'Important presentation for the marketing team due next Friday'"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 mb-2"
                            rows={3}
                        ></textarea>

                        <button
                            type="button"
                            onClick={() => {
                                if (isListening) {
                                    stopListening();
                                } else {
                                    startListening();
                                }
                            }}
                            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${isListening
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-indigo-100 hover:bg-indigo-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                }`}
                            disabled={isProcessing}
                        >
                            {isListening ? (
                                <FaMicrophoneSlash className="dark:text-gray-100" />
                            ) : (
                                <FaMicrophone className="text-indigo-500 dark:text-indigo-300" />
                            )}
                        </button>
                    </div>

                    {/* Character count indicator */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-right">
                        {voiceCommandText.length}/500 characters
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="text-red-500 dark:text-red-400 text-sm mb-3 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                            <span className="font-bold">Error: </span> {error}
                        </div>
                    )}

                    {isListening && (
                        <p className="text-sm text-indigo-500 dark:text-indigo-300 my-2 animate-pulse">
                            Listening... Speak your task now.
                        </p>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => processVoiceCommand(voiceCommandText)}
                            className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition dark:bg-indigo-600 dark:hover:bg-indigo-700 flex-1 mr-2"
                            disabled={isProcessing || !voiceCommandText.trim()}
                        >
                            {isProcessing ? "Processing..." : "Process Task"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setVoiceCommandText("");
                                setNlpAnalysis(null);
                                setShowNlpDetails(false);
                                setError("");
                            }}
                            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                            disabled={isProcessing}
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* NLP Analysis Results */}
                {nlpAnalysis && showNlpDetails && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">
                                Smart Analysis Results
                            </h3>
                            <button
                                onClick={() => setShowNlpDetails(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Hide
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-600 dark:text-gray-400">Priority:</div>
                            <div className={`font-medium ${nlpAnalysis.priority === 'High' ? 'text-red-500' :
                                nlpAnalysis.priority === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                {nlpAnalysis.priority}
                            </div>

                            <div className="text-gray-600 dark:text-gray-400">Category:</div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                {nlpAnalysis.category}
                            </div>

                            {nlpAnalysis.deadline?.hasDeadline && (
                                <>
                                    <div className="text-gray-600 dark:text-gray-400">Deadline:</div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                        {nlpAnalysis.deadline.text ||
                                            (nlpAnalysis.deadline.date && new Date(nlpAnalysis.deadline.date).toLocaleDateString())}
                                    </div>
                                </>
                            )}

                            {nlpAnalysis.contactPerson && (
                                <>
                                    <div className="text-gray-600 dark:text-gray-400">Contact:</div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                        {nlpAnalysis.contactPerson}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartPrioritization;

