const getToken = () => {
    var tokenString;

    // check session storage first
    if (sessionStorage.getItem("token")) {
        tokenString = sessionStorage.getItem("token");
    } else {
        tokenString = localStorage.getItem("token");
    }

    return tokenString;
};

const clearToken = () => {
    sessionStorage.setItem("token", null);
    localStorage.setItem("token", null);
};

export { getToken, clearToken };
