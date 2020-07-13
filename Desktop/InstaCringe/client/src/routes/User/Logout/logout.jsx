import React, { useEffect } from "react";

const Logout = () => {
    useEffect(() => {
        localStorage.removeItem("user-token");
        window.location = "/";
    }, []);
    return null;
};

export default Logout;
