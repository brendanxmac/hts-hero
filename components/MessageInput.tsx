import { useState, FormEvent } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isEnabled?: boolean;
}

export const MessageInput = ({
  onSendMessage,
  isEnabled = true,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && isEnabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!isEnabled}
          placeholder={isEnabled ? "Type your message..." : "Input disabled"}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!isEnabled || !message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
};
