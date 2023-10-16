import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { GiAnvil } from "react-icons/gi";
import { RiLockPasswordFill } from "react-icons/ri";

function Forgot() {
    let navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [reveal, setReveal] = useState(false);
    const [isMatchError, setIsMatchError] = useState(false);
    const [isError, setIsError] = useState(false);

    const update = async () => {
        setIsError(false);
        setIsMatchError(false);
        setIsLoading(true);

        // check if passwords match
        if (password !== rePassword) {
            setIsMatchError(true);
            setIsLoading(false);
            return;
        }

        // update password with temp token
        const response = await fetch(
            "http://localhost:3001/api/user/password/update",
            {
                method: "POST",
                type: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: searchParams.get("token"),
                    password: password,
                }),
            }
        );

        if (response.ok) {
            console.log("password update successful");
            navigate("/login");
        } else {
            setIsError(true);
        }

        setIsLoading(false);
    };

    return (
        <div className="flex h-screen w-screen bg-base-300 justify-center items-center">
            <div className="bg-base-100 flex flex-col justify-start items-center p-7 rounded-md w-1/4">
                <Link
                    to={"/"}
                    className="btn btn-ghost normal-case text-5xl flex flex-row gap-3 mt-5"
                >
                    <GiAnvil size={50} />
                    ANVIL
                </Link>
                <h1 className="pt-8">Reset your password</h1>
                {isMatchError ||
                    (isError && (
                        <div className="flex flex-row gap-2 pt-4">
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
                                {isError
                                    ? "Invalid or expired URL"
                                    : "Passwords do not match!"}
                            </span>
                        </div>
                    ))}

                <div className="flex pt-8">
                    <input
                        type={reveal ? "text" : "password"}
                        placeholder="Password"
                        className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus pl-10"
                        name="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                    <RiLockPasswordFill
                        size={20}
                        className="absolute mt-3.5 ml-3"
                    />
                </div>
                <div className="flex pt-4">
                    <input
                        type={reveal ? "text" : "password"}
                        placeholder="Retype password"
                        className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus pl-10"
                        name="rePassword"
                        value={rePassword}
                        onChange={(e) => {
                            setRePassword(e.target.value);
                        }}
                    />
                    <RiLockPasswordFill
                        size={20}
                        className="absolute mt-3.5 ml-3"
                    />
                </div>
                <label className="swap swap-flip text-2xl pt-8">
                    {/* this hidden checkbox controls the state */}
                    <input
                        type="checkbox"
                        onChange={() => {
                            setReveal(!reveal);
                        }}
                    />
                    <div className="swap-on">😈</div>
                    <div className="swap-off">😇</div>
                </label>
                <Link
                    onClick={update}
                    className="btn btn-outline btn-ghost mt-10 "
                >
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="loading loading-spinner text-primary w-8"></span>
                        </div>
                    ) : (
                        "Submit"
                    )}
                </Link>
            </div>
        </div>
    );
}

export default Forgot;
