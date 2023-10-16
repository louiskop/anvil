import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GiAnvil } from "react-icons/gi";
import { Link } from "react-router-dom";
import S3Bucket from "../components/S3Bucket";
import { getToken, clearToken } from "../utils/token.js";

function Profile() {
    let navigate = useNavigate();

    // Display profile or delete account
    const [displayProfile, setDisplayProfile] = useState(true);

    // loading for update/delete
    const [btnLoading, setBtnLoading] = useState(false);

    // Loading for fetch
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetch(
            "https://anvil-backend-rutl.onrender.com/api/user/profile/details",
            {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": getToken(),
                },
            }
        )
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    console.log(data.message);
                    setUserData(data.message);
                    setAvatarUrl(data.message.avatar);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                setLoading(false);
            });
    }, []);

    const updateProfile = async () => {
        setBtnLoading(true);

        if (formValues.oldPassword === "") {
            console.error("Must type in old password to update profile.");
            return;
        }

        if (formValues.newPassword !== formValues.reenterPassword) {
            console.error("New password and reentered password do not match.");
            return;
        }

        // Make body to send to update request
        const updatedUserData = {
            id: userData.id,
            username:
                formValues.newUsername === ""
                    ? userData.username
                    : formValues.newUsername,
            email:
                formValues.newEmail === ""
                    ? userData.email
                    : formValues.newEmail,
            avatar: avatarUrl === "" ? userData.avatar : avatarUrl,
            oldpassword: formValues.oldPassword,
            password: formValues.newPassword,
        };

        console.log(JSON.stringify(updatedUserData));

        try {
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/user/profile/update",
                {
                    method: "PUT",
                    mode: "cors",
                    body: JSON.stringify(updatedUserData),
                    headers: {
                        "Content-Type": "application/json",
                        // TODO: retrieve this token from session storage
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                console.log("Profile updated successfully");
                var data = await response.json();
                localStorage.setItem("token", data.authToken);
                sessionStorage.setItem("token", data.authToken);
                setBtnLoading(false);
                navigate("/");
            } else {
                console.log(response.message);
                console.error("Failed to update profile");
                setBtnLoading(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setBtnLoading(false);
        }
    };

    // Delete Profile
    const deleteProfile = async () => {
        setBtnLoading(true);
        try {
            const response = await fetch(
                `https://anvil-backend-rutl.onrender.com/api/user/profile/delete/`,
                {
                    method: "DELETE",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        // TODO: retrieve this token from session storage
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                console.log("Profile deleted successfully");
                setBtnLoading(false);
                clearToken();
                navigate("/login");
            } else {
                console.log(response.message);
                console.error("Failed to delete profile");
                setBtnLoading(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setBtnLoading(false);
        }
    };

    // Handle Avatar
    const [avatarUrl, setAvatarUrl] = useState("");
    const handleAvatarUpload = (s3Url) => {
        setAvatarUrl(s3Url);
    };

    // Handle other properties
    const [userData, setUserData] = useState({});
    const [formValues, setFormValues] = useState({
        newUsername: "",
        newEmail: "",
        oldPassword: "",
        newPassword: "",
        reenterPassword: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    return (
        <div className="flex h-screen w-screen bg-base-300 flex-col items-center">
            <div className="flex h-full flex-col items-center w-1/2">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="loading loading-spinner text-primary w-20"></span>
                    </div>
                ) : (
                    <>
                        <div className="tabs tabs-boxed w-[350px] h-12 gap-1 mt-24 mb-4 flex flex-row">
                            <div
                                className={`tab ${
                                    displayProfile === true ? "tab-active" : ""
                                } flex-1 h-full flex flex-row gap-2`}
                                onClick={() => setDisplayProfile(true)}
                            >
                                <p className="text-md">Edit profile</p>
                            </div>
                            <div
                                className={`tab ${
                                    displayProfile === false
                                        ? "btn-warning bg-warning"
                                        : ""
                                } flex-1 h-full flex flex-row gap-2`}
                                onClick={() => setDisplayProfile(false)}
                            >
                                <p className="text-md">Delete profile</p>
                            </div>
                        </div>
                        <div className="pop-in flex flex-col w-full items-center">
                            {/* EDIT PROFILE */}
                            <div
                                className={`pop-in flex flex-col w-full gap-3 ${
                                    displayProfile === true ? "" : "hidden"
                                }`}
                            >
                                <div className="w-full rounded-md bg-base-100 flex flex-col px-10 py-5 items-center">
                                    <Link
                                        to={"/"}
                                        className="btn btn-ghost flex flex-row gap-2 h-16 mb-2 items-center justify-center"
                                    >
                                        <GiAnvil size={50} />
                                        <div className="text-5xl">ANVIL</div>
                                    </Link>
                                    <div className="divider m-0 mb-4 p-0"></div>
                                    <div className="w-full flex flex-row items-center">
                                        <div className="flex flex-1 flex-row gap-5 items-center">
                                            <div className="avatar rounded-full ring-1 ring-primary ring-offset-base-100 ring-offset-4">
                                                <div className="w-24 rounded-full">
                                                    <img
                                                        src={avatarUrl}
                                                        alt="User Avatar"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-1 flex-col gap-1 ">
                                                <div className="text-xl ">
                                                    Upload a New Photo
                                                </div>
                                                <div className="italic text-lg">
                                                    {userData.avatar}
                                                </div>
                                            </div>
                                        </div>
                                        <S3Bucket
                                            setNewAvatarLink={
                                                handleAvatarUpload
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="w-full flex-1 flex gap-3 flex-col p-6 rounded-md bg-base-100">
                                    <div className="flex w-full flex-row gap-3 items-center">
                                        <div className="flex-1 text-lg">
                                            Username
                                        </div>
                                        <input
                                            type="text"
                                            name="newUsername"
                                            placeholder={userData.username}
                                            value={formValues.newUsername}
                                            onChange={handleInputChange}
                                            className={`bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus 
                                    ${
                                        formValues.newUsername !== ""
                                            ? "outline outline-1 outline-primary"
                                            : ""
                                    }`}
                                        />
                                    </div>
                                    <div className="flex w-full flex-row gap-3 items-center">
                                        <div className="flex-1 text-lg">
                                            Email
                                        </div>
                                        <input
                                            type="text"
                                            name="newEmail"
                                            placeholder={userData.email}
                                            value={formValues.newEmail}
                                            onChange={handleInputChange}
                                            className={`bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus 
                                    ${
                                        formValues.newEmail !== ""
                                            ? "outline outline-1 outline-primary"
                                            : ""
                                    }`}
                                        />
                                    </div>
                                    <div className="flex w-full flex-row gap-3 items-center">
                                        <div className="flex-1 text-lg">
                                            Old Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </div>
                                        <input
                                            type="password"
                                            name="oldPassword"
                                            placeholder={""}
                                            value={formValues.oldPassword}
                                            onChange={handleInputChange}
                                            className={`bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus 
                                    ${
                                        formValues.oldPassword !== ""
                                            ? "outline outline-1 outline-primary"
                                            : ""
                                    }`}
                                        />
                                    </div>
                                    <div className="flex w-full flex-row gap-3 items-center">
                                        <div className="flex-1 text-lg">
                                            New Password
                                        </div>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder={"****"}
                                            value={formValues.newPassword}
                                            onChange={handleInputChange}
                                            className={`bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus 
                                    ${
                                        formValues.newPassword !== ""
                                            ? "outline outline-1 outline-primary"
                                            : ""
                                    }`}
                                        />
                                    </div>
                                    <div className="flex w-full flex-row gap-3 items-center">
                                        <div className="flex-1 text-lg">
                                            Re-enter new Password
                                        </div>
                                        <input
                                            type="password"
                                            name="reenterPassword"
                                            placeholder={"****"}
                                            value={formValues.reenterPassword}
                                            onChange={handleInputChange}
                                            className={`bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus 
                                    ${
                                        formValues.reenterPassword !== ""
                                            ? "outline outline-1 outline-primary"
                                            : ""
                                    }`}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary btn-outline"
                                        onClick={updateProfile}
                                    >
                                        {btnLoading ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="loading loading-spinner text-primary w-8"></span>
                                            </div>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </div>
                            {/* DELETE PROFILE */}
                            <div
                                className={`pop-in flex flex-col w-full gap-3 ${
                                    displayProfile === false ? "" : "hidden"
                                }`}
                            >
                                <div className="w-full rounded-md bg-base-100 flex flex-col px-10 py-5 items-center">
                                    <Link
                                        to={"/"}
                                        className="btn btn-ghost flex flex-row gap-2 h-16 mb-2 items-center justify-center"
                                    >
                                        <GiAnvil size={50} />
                                        <div className="text-5xl">ANVIL</div>
                                    </Link>
                                    <div className="divider m-0 mb-4 p-0"></div>
                                    <div className="w-full flex flex-row items-center">
                                        <div className="flex flex-1 flex-col gap-2">
                                            <div className="text-xl font-bold text-warning">
                                                You are about to DELETE your
                                                account.
                                            </div>
                                            <div className="text-sm text-warning">
                                                This action cannot be reverted.
                                            </div>
                                        </div>
                                        <button
                                            className="btn font-bold btn-warning btn-outline h-14"
                                            onClick={deleteProfile}
                                        >
                                            {btnLoading ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="loading loading-spinner text-warning w-8"></span>
                                                </div>
                                            ) : (
                                                "Delete Account"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;
