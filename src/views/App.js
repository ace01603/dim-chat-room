import { useState, useReducer, useEffect, useRef } from "react";
import JoinChat from "../components/JoinChat";
import Messages from "../components/Messages";
import Form from "../components/Form";

const BOT_MESSAGES = {
    "OK": ["sup", "how are you?", "what did you have for lunch?", "don't know", "cool cool cool", "lol", "rofl"],
    "personal": ["same to you, buddy", ":(", "fuming", "how dare you", "rude"],
    "inappropriate": ["that's gross", "please don't use language like that", "eww", "that's inappropriate"],
    "general": ["I am offended", "I thought we were friends", "jerk", "hmmmm"]
}

const App = () => {
    const messageReducer = (state, newMessage) => {
        return [...state, newMessage];
    }

    const bottom = useRef(null);

    const [isConnected, connect] = useState(false);
    const [userName, setUsername] = useState("");
    const [messages, addMessage] = useReducer(messageReducer, []);

    const userConnected = user => {
        connect(true);
        setUsername(user);
        addMessage({"user": "Bot", "message": `Hello, ${user}!`});
    }

    const randomIndex = key => {
        return Math.round(Math.random() * (BOT_MESSAGES[key].length - 1));
    }

    useEffect(() => {
        if (messages && messages.length > 0 && messages[messages.length-1].user === userName) {
            setTimeout(() => {
                const results = messages[messages.length-1].results;
                let msg = "I see...";
                if (Object.keys(results).length === 0) {
                    msg = BOT_MESSAGES["OK"][randomIndex("OK")];
                } else if (Object.keys(results).includes("identity_attack") || Object.keys(results).includes("insult") || Object.keys(results).includes("threat")) {
                    msg = BOT_MESSAGES["personal"][randomIndex("personal")];
                } else if (Object.keys(results).includes("obscene") || Object.keys(results).includes("sexual_explicit")) {
                    msg = BOT_MESSAGES["inappropriate"][randomIndex("innapropriate")];
                } else {
                    msg = BOT_MESSAGES["general"][randomIndex("general")];
                }
                addMessage({"user": "Bot", "message": msg})
            }, 1000);
        }
        bottom.current.scrollIntoView({behavior: 'smooth'});
    }, [messages, userName])

    return (
        <div className="container">
            {
                isConnected ?
                    <>
                        <Messages user={userName} messages={messages} />
                        <Form user={userName} addMessage={addMessage} />
                    </>
                    :
                    <JoinChat onJoin={userConnected} />
            }
            <div ref={bottom} />
        </div>
    );
}

export default App;
