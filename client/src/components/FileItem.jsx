import React, { useState, useEffect } from "react";
import { GoLink, GoNoEntry, GoSignOut } from "react-icons/go";

function calculateColor(letter) {
    const asciiValue = letter.charCodeAt(0);
    const hue = (asciiValue % 26) * 15; // Adjust the multiplier for a broader range of colors
    return `hsl(${hue}, 80%, 50%)`;
}

const FileItem = ({ file, onLinkClick, onDeleteClick, activateNote, isOwner, leaveSharedNote }) => {
    return (
        <div className="flex flex-row justify-between items-center gap-3 p-2 rounded-md hover:bg-neutral">
            <div className="tooltip tooltip-primary tooltip-right" data-tip={file.category}>
                <span className="w-4 overflow-x-auto font-bold flex items-center justify-center tooltip"
                    style={{ color: calculateColor(file.category[0].toUpperCase()) }}>
                    {file.category ? file.category[0].toUpperCase() : ""}
                </span>
            </div>
            <div className="w-full overflow-x-auto">
                <div
                    className="overflow-x-auto cursor-pointer whitespace-nowrap overflow-wrap-break-word flex flex-row gap-2"
                    onClick={() => {
                        activateNote(file);
                    }}
                >
                    {file.name}
                </div>
            </div>
            {isOwner ? (<div className="flex flex-row gap-1">
                <GoLink
                    size={28}
                    onClick={() => onLinkClick([true, file])}
                    className="p-1 hover:text-white hover:cursor-pointer active:text-opacity-60"
                />
                <GoNoEntry
                    size={28}
                    onClick={() => onDeleteClick(file)}
                    className="p-1 hover:text-red-500 hover:cursor-pointer active:text-opacity-60"
                />
            </div>
            ) : (
                <div>
                    <GoSignOut
                        size={28}
                        onClick={() => leaveSharedNote(file)}
                        className="p-1 hover:text-red-500 hover:cursor-pointer active:text-opacity-60"
                    />
                </div>
            )}
        </div>
    );
};

export default FileItem;
