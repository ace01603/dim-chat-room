import { useState } from "react";
import * as toxicity from '@tensorflow-models/toxicity';

const THRESHOLD = 0.7;
const STATUS = {
    NOT_CHECKED: 0,
    CHECKING: 1,
    TOXIC: 2,
    NOT_TOXIC: 3
}

let model;
toxicity.load(THRESHOLD).then(toxicityModel => model = toxicityModel);

const Form = ({user, addMessage}) => {
    const [messageTxt, setMessageTxt] = useState("");
    const [toxicityStatus, setToxicityStatus] = useState(STATUS.NOT_CHECKED);
    const [results, setResults] = useState({});

    const processInput = event => {
        setMessageTxt(event.target.value);
        if (toxicityStatus === STATUS.TOXIC) {
            setToxicityStatus(STATUS.NOT_CHECKED);
        }
    }

    const processMessage = () => {
        if (toxicityStatus === STATUS.NOT_CHECKED) {
            setToxicityStatus(STATUS.CHECKING);
            model.classify(messageTxt).then(predictions => {
                    console.log(predictions);
                    let problems = {};
                    for (let pred of predictions) {
                        if (pred.results[0].match) {
                            problems[pred.label] = pred.results[0].probabilities[1]; // Gets the true probability
                        }
                    }
                    if (Object.keys(problems).length === 0) {// Not toxic
                        console.log("OK");
                        setToxicityStatus(STATUS.NOT_TOXIC);
                        setResults(problems);
                    } else {
                        console.log("BAD", problems);
                        setToxicityStatus(STATUS.TOXIC);
                        setResults(problems);
                    }
            });
        } else sendMessageAndClearForm();
    }

    const sendMessageAndClearForm = () => {
        addMessage({"user": user, "message": messageTxt, "results": results});
        setMessageTxt("");
        setToxicityStatus(STATUS.NOT_CHECKED);
    }

    const onKeyUp = event => {
        if (event.keyCode === 13) processMessage();
    }

    const getButtonText = () => {
        if (toxicityStatus === STATUS.NOT_CHECKED) {
            return "Check and send";
        }
        else if (toxicityStatus === STATUS.CHECKING) {
            return <>Checking <span>.</span><span>.</span><span>.</span></>
        } else if (toxicityStatus === STATUS.TOXIC) {
            return "Send anyway";
        } else {
            return "Continue to send";
        }
    }

    return (
        <form className="my-4" onSubmit={e => e.preventDefault()}>
            <div className="row">
                <div className="col">
                    <input aria-label="Your message" type="text" className="form-control" id="messageTxt"
                        placeholder="Enter your message" value={messageTxt}
                        invalid={`${toxicityStatus === STATUS.TOXIC}`} disabled={toxicityStatus === STATUS.CHECKING}
                        onChange={processInput}
                        onKeyUp={onKeyUp}
                         />
                </div>
                <div className="col-auto">
                    <button type="button" className="btn btn-dark float-right"
                            onClick={processMessage}
                            disabled={toxicityStatus === STATUS.CHECKING}
                            >
                        {getButtonText()}
                    </button>
                </div>
                <div className="invalid-feedback" style={toxicityStatus === STATUS.TOXIC ? {display:"block"} : {display: "none"}}>
                    Your message might be toxic!
                </div>
                <div className="valid-feedback" style={toxicityStatus === STATUS.NOT_TOXIC ? {display:"block"} : {display: "none"}}>
                    Your message seems fine
                </div>
            </div>
        </form>
    );
}

export default Form;