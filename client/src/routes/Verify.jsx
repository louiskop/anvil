import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { GiAnvil } from "react-icons/gi";

function Verify() {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(true);

    useEffect(() => {
        async function verifyAcc() {
            setIsLoading(true);
            const tokenStr = searchParams.get("token");

            // send update api call
            const response = await fetch(
                "http://localhost:3001/api/user/account/confirm",
                {
                    method: "POST",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: tokenStr,
                    }),
                }
            );

            // display message on success or error
            if (response.ok) {
                setIsSuccess(true);
            } else {
                setIsSuccess(false);
            }

            setIsLoading(false);
        }
        verifyAcc();
    }, []);

    return (
        <div className="flex h-screen w-screen bg-base-300 justify-center items-center">
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="loading loading-spinner text-primary w-20"></span>
                </div>
            ) : (
                <div className="bg-base-100 flex flex-col justify-start items-center p-7 rounded-md w-1/4">
                    <Link
                        to={"/"}
                        className="btn btn-ghost normal-case text-5xl flex flex-row gap-3 mt-5"
                    >
                        <GiAnvil size={50} />
                        ANVIL
                    </Link>
                    <h1 className="pt-8">
                        {isSuccess
                            ? "Your account has been verified!"
                            : "Failure to activate account, token has expired or is invalid"}
                    </h1>
                    <Link
                        to="/login"
                        className="btn btn-outline btn-ghost mt-10 "
                    >
                        Back to Login
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Verify;
