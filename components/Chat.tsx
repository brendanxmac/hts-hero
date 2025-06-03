import { ChatProps } from "../types/chat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import SearchInput from "./SearchInput";

export const Chat = ({
  messages,
  onSendMessage,
  isInputEnabled = true,
}: ChatProps) => {
  return (
    <div className="flex flex-col h-full rounded-lg shadow-lg min-w-2xl max-w-3xl mx-auto">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      <SearchInput
        placeholder="Your response..."
        setProductDescription={onSendMessage}
      />
      {/* <MessageInput onSendMessage={onSendMessage} isEnabled={isInputEnabled} /> */}
    </div>
  );
};
