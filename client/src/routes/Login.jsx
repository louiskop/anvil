import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiAnvil } from "react-icons/gi";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import { BiSolidUser } from "react-icons/bi";
import { Link } from "react-router-dom";

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";

function Login() {
    let navigate = useNavigate();

    // login = true, register = false
    const [mode, setMode] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [isExists, setIsExists] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        avatar_url: "",
        remember_me: false,
    });

    const handleChange = (e) => {
        // update formData
        var { name, value } = e.target;
        if (name == "remember_me") {
            value = e.target.checked;
        }
        setFormData({
            ...formData,
            [name]: value,
        });
        return;
    };

    const validate = async () => {
        setIsLoading(true);
        setIsError(false);
        setEmailSent(false);
        setIsExists(false);

        // trigger forgot password logic
        if (mode && isForgot) {
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/user/password/forgot",
                {
                    method: "POST",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                    }),
                }
            );

            if (response.ok) {
                setEmailSent(true);
                setIsForgot(false);
            } else {
                setIsError(true);
            }

            setIsLoading(false);
            return;
        }

        // sign in or register
        if (mode) {
            console.log("logging in ...");

            // login api call
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/user/login",
                {
                    method: "POST",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        remember_me: formData.remember_me,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();

                // extract and store user auth token
                if (formData.remember_me) {
                    // use localStorage and session storage for speed
                    localStorage.setItem("token", data.token);
                    sessionStorage.setItem("token", data.token);
                } else {
                    // use sessionStorage
                    sessionStorage.setItem("token", data.token);
                }
                setIsLoading(false);
                navigate("/");
            } else {
                setIsLoading(false);
                setIsError(true);
            }
        } else {
            console.log("registering");

            // register api call
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/user/signup",
                {
                    method: "POST",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        email: formData.email,
                        remember_me: formData.remember_me,
                        avatar: formData.avatar_url,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();

                setIsLoading(false);
                setEmailSent(true);
            } else {
                console.log("ERROR WITH REGISTER API CALL");
                setIsError(true);
                setIsExists(true);
                setIsLoading(false);
            }
        }
    };

    // S3 code
    const allowedImageTypes = ["image/jpeg", "image/png"];

    function generateFileName(filename, length) {
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomText = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomText += characters.charAt(randomIndex);
        }

        let filenameParts = filename.split(".");
        return filenameParts[0] + randomText + "." + filenameParts[1];
    }

    const uploadFile = async (file) => {
        if (!allowedImageTypes.includes(file.type)) {
            console.log(file.type);
            alert("Please select a valid image type.");
            return;
        }

        const S3_BUCKET = "anvil-photos";
        const REGION = "eu-west-1";

        const s3Client = new S3Client({
            region: REGION,
            credentials: {
                accessKeyId: "AKIAYNAX2JHFFUKBVYTH",
                secretAccessKey: "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",
            },
        });

        const params = {
            Bucket: S3_BUCKET,
            Key: generateFileName(file.name, 16),
            Body: file,
        };

        try {
            const response = await s3Client.send(new PutObjectCommand(params));

            const S3link =
                "https://anvil-photos.s3.eu-west-1.amazonaws.com/" + params.Key;
            setFormData({
                ...formData,
                avatar_url: S3link,
            });

            console.log("S3 Upload Response:", response);
            alert("File uploaded successfully.");
        } catch (error) {
            console.error("Error uploading file to S3:", error);
        }
    };

    return (
        <div className="flex h-screen w-screen bg-base-300 justify-center items-center">
            <div className="join flex justify-center mt-10 absolute top-4 right-12">
                <input
                    className="join-item btn"
                    type="radio"
                    name="options"
                    aria-label="LOGIN"
                    onClick={() => setMode(true)}
                    defaultChecked
                />
                <input
                    className="join-item btn"
                    type="radio"
                    name="options"
                    aria-label="REGISTER"
                    onClick={() => setMode(false)}
                />
            </div>

            <div className="bg-base-100 flex flex-col justify-start items-center p-7 rounded-md w-1/4">
                <Link
                    to={"/"}
                    className="btn btn-ghost normal-case text-5xl flex flex-row gap-3 mt-5"
                >
                    <GiAnvil size={50} />
                    ANVIL
                </Link>
                {mode ? (
                    <div className="flex flex-col mt-10 gap-4">
                        {isError && (
                            <div className="flex flex-row gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-current shrink-0 h-6 w-6 text-red-500 pl-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-red-500">
                                    {isExists
                                        ? "User already exists"
                                        : "Incorrect Username or Password"}
                                </span>
                            </div>
                        )}
                        {emailSent && (
                            <div className="flex flex-row gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-current shrink-0 text-green-500 h-6 w-6 pl-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-green-500">
                                    Email sent to {formData.username}'s address!
                                </span>
                            </div>
                        )}

                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Username"
                                className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus pl-10"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <BiSolidUser
                                size={20}
                                className="absolute mt-3.5 ml-3"
                            />
                        </div>
                        {!isForgot && (
                            <div className="flex">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus pl-10"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <RiLockPasswordFill
                                    size={20}
                                    className="absolute mt-3.5 ml-3"
                                />
                            </div>
                        )}
                        {!isForgot && (
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">
                                        Remember me
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="remember_me"
                                        value={formData.remember_me}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                        )}
                        <a
                            className="link text-sm text-center pt-4"
                            onClick={() => setIsForgot(!isForgot)}
                        >
                            {isForgot ? "Back to Login" : "Forgot Password ?"}
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col mt-10 gap-4">
                        {isError && isExists && (
                            <div className="flex flex-row gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-current shrink-0 h-6 w-6 text-red-500 pl-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-red-500">
                                    User already exists
                                </span>
                            </div>
                        )}
                        {emailSent && !isForgot && (
                            <div className="flex flex-row gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-current shrink-0 text-green-500 h-6 w-6 pl-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-green-500">
                                    Verification email sent to{" "}
                                    {formData.username}'s address!
                                </span>
                            </div>
                        )}

                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Email"
                                className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus pl-10"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <MdEmail
                                size={20}
                                className="absolute mt-3.5 ml-3"
                            />
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Username"
                                className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus pl-10"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <BiSolidUser
                                size={20}
                                className="absolute mt-3.5 ml-3"
                            />
                        </div>
                        <div className="flex">
                            <input
                                type="password"
                                placeholder="Password"
                                className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus pl-10"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <RiLockPasswordFill
                                size={20}
                                className="absolute mt-3.5 ml-3"
                            />
                        </div>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">
                                    Pick a profile picture
                                </span>
                            </label>
                            <input
                                type="file"
                                onChange={(e) => uploadFile(e.target.files[0])}
                                className="file-input file-input-bordered w-full max-w-xs"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Remember me</span>
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    name="remember_me"
                                    value={formData.remember_me}
                                    onChange={handleChange}
                                />
                            </label>
                        </div>
                    </div>
                )}
                <Link
                    onClick={validate}
                    className="btn btn-outline btn-ghost mt-10 "
                >
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="loading loading-spinner text-primary w-8"></span>
                        </div>
                    ) : isForgot && mode ? (
                        "Send Recovery Email"
                    ) : (
                        "Submit"
                    )}
                </Link>
            </div>
        </div>
    );
}

export default Login;
