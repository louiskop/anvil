import React from "react";
import { GoPersonAdd, GoXCircle } from "react-icons/go";
import { getToken } from "../utils/token";

const UserInviteItem = ({
    user,
    file,
    alreadyInvited = false,
    invitedUsers,
    setInvitedUsers,
    notInvitedUsers,
    setNotInvitedUsers,
    rawUsersThatAreNotInvited,
    rawUsersThatAreInvited,
    setRawUsersThatAreNotInvited,
    setRawUsersThatAreInvited,
}) => {
    // Share a note with a user
    const addUserToNote = async (note, shareWithUser) => {
        try {
            const updatedInvitedUsers = [...invitedUsers, shareWithUser];
            const rawUpdatedInvitedUsers = [
                ...rawUsersThatAreInvited,
                shareWithUser,
            ];
            const updatedNotInvitedUsers = notInvitedUsers.filter(
                (user) => user.id !== shareWithUser.id
            );
            const rawUpdatedNotInvitedUsers = rawUsersThatAreNotInvited.filter(
                (user) => user.id !== shareWithUser.id
            );
            setInvitedUsers(updatedInvitedUsers);
            setRawUsersThatAreInvited(rawUpdatedInvitedUsers);
            setNotInvitedUsers(updatedNotInvitedUsers);
            setRawUsersThatAreNotInvited(rawUpdatedNotInvitedUsers);

            const shareData = {
                noteId: note.id,
                shareWith: shareWithUser.username,
            };

            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/share/",
                {
                    method: "POST",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                    body: JSON.stringify(shareData),
                }
            );

            if (response.ok) {
                const resData = await response.json();
                console.log("Note shared.", resData.message);
            } else {
                console.error("Failed to fetch shared notes");
            }
        } catch (error) {
            console.error(`An error occured: ${error}`);
        }
    };

    // TODO:
    const deleteUserFromNote = async (note, shareWithUser) => {
        try {
            const updatedInvitedUsers = invitedUsers.filter(
                (user) => user.id !== shareWithUser.id
            );
            const rawUpdatedInvitedUsers = rawUsersThatAreInvited.filter(
                (user) => user.id !== shareWithUser.id
            );
            const updatedNotInvitedUsers = [...notInvitedUsers, shareWithUser];
            const rawUpdatedNotInvitedUsers = [
                ...rawUsersThatAreNotInvited,
                shareWithUser,
            ];
            setInvitedUsers(updatedInvitedUsers);
            setRawUsersThatAreInvited(rawUpdatedInvitedUsers);
            setNotInvitedUsers(updatedNotInvitedUsers);
            setRawUsersThatAreNotInvited(rawUpdatedNotInvitedUsers);

            const shareData = {
                noteId: note.id,
                shareWith: shareWithUser.id,
            };

            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/share/delete",
                {
                    method: "DELETE",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                    body: JSON.stringify(shareData),
                }
            );

            if (response.ok) {
                const resData = await response.json();
                console.log("Note shared.", resData.message);
            } else {
                console.error("Failed to fetch shared notes");
            }
        } catch (error) {
            console.error(`An error occured: ${error}`);
        }
    };

    return (
        <div className="w-full px-2 py-1/2 ">
            <div className="flex flex-row justify-center items-center gap-3 w-full h-full rounded-md hover:bg-neutral-focus p-2">
                <div className="avatar">
                    <div className="rounded-full w-9">
                        <img src={user.avatar} />
                    </div>
                </div>
                <span className="flex-1 h-full overflow-x-auto text-lg">
                    {user.username}
                </span>
                {!alreadyInvited ? (
                    <div className="">
                        <GoPersonAdd
                            size={24}
                            onClick={() => addUserToNote(file, user)}
                            className="hover:text-white hover:cursor-pointer active:text-opacity-60 mx-2"
                        />
                    </div>
                ) : (
                    <div className="">
                        <GoXCircle
                            size={24}
                            onClick={() => deleteUserFromNote(file, user)}
                            className="hover:text-red-500 hover:cursor-pointer active:text-opacity-60 mx-2"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInviteItem;
