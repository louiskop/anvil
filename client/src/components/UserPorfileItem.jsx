import React from "react";

const UserPorfileItem = ({ name, avatar }) => {
    return (
        <div className="w-full flex flex-row gap-3">
            <div className="avatar online">
                <div className="rounded-full w-7">
                    <img src={avatar} />
                </div>
            </div>
            <span className="flex-1 overflow-x-auto">{name}</span>
        </div>
    );
};

export default UserPorfileItem;
