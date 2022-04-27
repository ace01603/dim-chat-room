const Messages = ({ user, messages }) => {
    return <table className="table my-4">
        <tbody>
            {
                messages.map((message, index) =>
                    <tr key={`msg-${index}`}>
                        <td className={message.user === user ? "user" : "bot"}>
                            <p>
                                <span className="user-id">{message.user}</span><br/>{message.message}
                            </p>
                        </td>
                    </tr>
                )
            }
        </tbody>
    </table>
}

export default Messages;