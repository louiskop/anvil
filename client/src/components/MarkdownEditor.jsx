import React, { useState, useEffect } from "react";
import { marked } from "marked";
import "../styles/Animations.css";
import { Socket } from "socket.io-client";

function MarkdownEditor({ markupViewStateInput, activeNote, socket }) {
    // set text to the file's content
    useEffect(() => {
        console.log(
            "received a new active note in markdown place: ",
            activeNote
        );
        setText(activeNote.content);
    }, [activeNote]);

    useEffect(() => {
        // listen for and update note content
        socket.on("push_update", ({ noteId, updatedContent }) => {
            console.log("Received updated Content", updatedContent);
            // setNotes(
            //     notes.map((note) => {
            //         if (note.id == noteId) {
            //             note.content = updatedContent;
            //         }
            //         return note;
            //     })
            // );
            setText(updatedContent);
            document.getElementById("textarea2").innerHTML =
                marked.parse(updatedContent);
        });

        // remove listeners
        return () => {
            socket.off("push_update");
        };
    }, [socket]);

    const [text, setText] = useState("");

    const handleTextareaChange = (event) => {
        setText(event.target.value);
        document.getElementById("textarea2").innerHTML = marked.parse(
            event.target.value
        );
        let noteId = activeNote.id;
        let updatedContent = event.target.value;

        // send updated content over websocket
        socket.emit("update_note", { noteId, updatedContent });
    };

    useEffect(() => {
        document.getElementById("textarea2").innerHTML = marked.parse(text);
    }, [markupViewStateInput]);

    // For pop-in rerender
    useEffect(() => {
        setKey1(Date.now());
        setKey2(Date.now() + 1);
    }, [markupViewStateInput]);
    const [key1, setKey1] = useState(Date.now());
    const [key2, setKey2] = useState(Date.now() + 1);

    return (
        <div className="h-full w-full p-4">
            <div className="w-full h-full flex flex-row gap-5">
                <div
                    key={key1}
                    className={`${markupViewStateInput === "markup_view"
                        ? "flex-grow  pop-in"
                        : markupViewStateInput === "reader_view"
                            ? "hidden"
                            : "pop-in w-1/2"
                        } h-full bg-base-200 rounded-md p-4`}
                >
                    <textarea
                        id="textarea1"
                        className="h-full w-full overflow-auto block outline-none resize-none bg-base-200"
                        placeholder="Write your Markdown here..."
                        onChange={handleTextareaChange}
                        value={text}
                    ></textarea>
                </div>
                <div
                    className={`${markupViewStateInput === "reader_view"
                        ? "flex-grow  pop-in"
                        : markupViewStateInput === "markup_view"
                            ? "hidden"
                            : " pop-in w-1/2"
                        }  h-full bg-neutral rounded-md p-4`}
                >
                    <div
                        className="h-full w-full overflow-auto"
                        id="textarea2"
                    ></div>
                </div>
            </div>
        </div>
    );
}

export default MarkdownEditor;
