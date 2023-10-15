import React, { useState, useEffect } from "react";
import { GiAnvil } from "react-icons/gi";
import {
    GoSearch,
    GoFilter,
    GoPeople,
    GoPlusCircle,
    GoPerson,
    GoSignOut,
    GoX,
    GoTypography,
    GoCheck,
    GoTrash,
    GoLink,
    GoTag,
    GoPlus,
    GoArrowUp,
    GoArrowDown,
} from "react-icons/go";
import { BsCodeSlash, BsSquareHalf } from "react-icons/bs";
import { Link } from "react-router-dom";
import FileItem from "../components/FileItem";
import UserPorfileItem from "../components/UserPorfileItem";
import MarkdownEditor from "../components/MarkdownEditor";
import UserInviteItem from "../components/UserInviteItem";
import CategoryItem from "../components/CategoryItem";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../utils/token";
import io from "socket.io-client";

// connect to socket on server
const socket = io.connect("https://anvil-backend-rutl.onrender.com");

function Home() {
    let navigate = useNavigate();

    // Navbar height
    const navbarHeight = "100px";
    const bodyHeight = `calc(100vh - ${navbarHeight})`;

    // Sidebar width
    const sidebarWidth = "380px";
    const bodyWidth = `calc(100vw - ${sidebarWidth})`;

    // Variables
    const [noteName, setNoteName] = useState("");
    const [filterState, setFilter] = useState("All");
    const [rawNotes, setRawNotes] = useState([]);
    const [rawSharedNotes, setRawSharedNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [sharedFilteredNotes, setSharedFilteredNotes] = useState([]);
    const [categoryState, setCategory] = useState("Personal");
    const [newCategory, setNewCategory] = useState("");
    const [displayFilesState, setDisplayFilesState] = useState("my_files");
    const [markupViewState, setMarkupViewState] = useState("markup_view");
    const [watchNotes, setWatchNotes] = useState(false);
    const [notesSearchText, setNotesSearchText] = useState("");
    const [invitePanelState, setInvitePanelState] = useState([false, null]);
    const [currentlyEditing, setCurrentlyEditing] = useState([]);
    const [isASC, setIsASC] = useState(true);
    const [userSearchText, setUserSearchText] = useState("");

    // raw data
    const [userDetails, setUserDetails] = useState({});

    // form change funcs
    const handleNoteNameChange = (e) => {
        setNoteName(e.target.value);
    };

    //add to list

    // redirect user if not logged in
    useEffect(() => {
        var token = getToken();
        if (token === "null") {
            console.error("USER NOT LOGGED IN , REDIRECTING TO LOGIN");
            navigate("/login");
        }
    }, []);

    // fetch user details
    useEffect(() => {
        async function fetchData() {
            // fetch user data
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/user/profile/details",
                {
                    method: "GET",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setUserDetails(data.message);
            } else {
                console.log(" ERROR FETCHING DETAILS ");
            }
        }

        fetchData();
        fetchCategories();
    }, []);

    // logout
    const handleLogout = () => {
        clearToken();
        navigate("/login");
    };

    // Fetching notes
    const [notes, setNotes] = useState(null);
    useEffect(() => {
        fetchNotes();
    }, [watchNotes, isASC]);

    const fetchNotes = async () => {
        try {
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/note/my/notes",
                {
                    method: "GET",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                var resNotes = await response.json();

                if (isASC) {
                    resNotes = resNotes.reverse();
                }

                setRawNotes(resNotes);
                setFilteredNotes(resNotes);
                setNotes(resNotes);

                filterNotes(filterState, { my: resNotes });

                console.log("Notes fetched successfully:", notes);
            } else {
                console.error("Failed to fetch notes.");
            }
        } catch (error) {
            console.error(`An error occurred: ${error}`);
        }
    };

    // Fetching shared notes
    const [sharedNotes, setSharedNotes] = useState(null);
    useEffect(() => {
        fetchSharedNotes();
    }, [displayFilesState, isASC]);

    const fetchSharedNotes = async () => {
        try {
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/share/my/sharedNotes",
                {
                    method: "GET",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                const resData = await response.json();
                console.log("Successful shared notes recv: ", resData);
                if (Object.keys(resData).length === 0) {
                    setRawSharedNotes([]);
                    setSharedFilteredNotes([]);
                    setSharedNotes([]);
                } else {
                    var resNotes = resData.message;
                    if (isASC) {
                        resNotes = resNotes.reverse();
                    }

                    setRawSharedNotes(resNotes);
                    setSharedFilteredNotes(resNotes);
                    setSharedNotes(resNotes);
                    filterNotes(filterState, { shared: resNotes });
                }
            } else {
                console.error("Failed to fetch shared notes");
            }
        } catch (error) {
            console.error(`An error occured: ${error}`);
        }
    };

    //Fetch all Categories
    const [categories, setCategories] = useState(null);
    const fetchCategories = async () => {
        try {
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/category/",
                {
                    method: "GET",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                const resData = await response.json();
                setCategories(resData.message);
                console.log("Successful categories recv: ", resData.message);
            } else {
                console.error("Failed to fetch categories");
            }
        } catch (error) {
            console.error(`An error occured: ${error}`);
        }
    };

    //Add category
    const [addingCategory, setAddingCategory] = useState(false);
    const addCategory = async (newCategory) => {
        try {
            setAddingCategory(true);
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/category/add",
                {
                    method: "POST",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                    body: JSON.stringify({ name: newCategory }),
                }
            );

            if (response.ok) {
                setCategory(newCategory);
                setNewCategory("");
                console.log("Category added");
                fetchCategories();
                setAddingCategory(false);
            } else {
                console.error("Failed to add category");
                setAddingCategory(false);
            }
        } catch (error) {
            console.error("An error occurred:", error);
            setAddingCategory(false);
        }
    };

    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const createNote = async () => {
        setIsCreatingNote(true);

        const noteData = {
            name: noteName,
            content: "",
            category: categoryState,
        };

        try {
            const response = await fetch(
                "https://anvil-backend-rutl.onrender.com/api/note/create",
                {
                    method: "POST",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                    body: JSON.stringify(noteData),
                }
            );

            if (response.ok) {
                console.log("Note created");
                setNoteName("");
                setWatchNotes(!watchNotes);
                setIsCreatingNote(false);
            } else {
                console.error("Failed to create the note.");
                setIsCreatingNote(false);
            }
        } catch (error) {
            console.error("An error occurred:", error);
            setIsCreatingNote(false);
        }
    };

    // handle active note
    const [activeNote, setActiveNote] = useState({ content: "" });
    const activateNote = (note) => {
        // leave previous note room
        if (activeNote.id) {
            let noteId = activeNote.id;
            socket.emit("leave_note", { noteId, userDetails });
        }

        // join noteroom
        // TODO: Eeerste ou fetch
        console.log("Joining note-room:");
        let noteId = note.id;
        socket.emit("join_note", { noteId, userDetails });

        // update active note
        setActiveNote(note);
    };

    // receive socket messages
    useEffect(() => {
        // listen for and update editors
        socket.on("editors", (data) => {
            console.log("received editors: ", data.users);
            setCurrentlyEditing(data.users);
        });

        // stop listening on component unmount
        return () => {
            // leave the current note
            console.log("going to leave the note now!!!!");
            if (activeNote.noteId) {
                socket.emit("leave_note", { noteId, userDetails });
            }
            socket.off("editors");
        };
    }, [socket]);

    // filter notes (pass in an optional fastData for when setState is too slow)
    const filterNotes = (filter, fastData = {}) => {
        const rawNotesArg = fastData.my ? fastData.my : rawNotes;
        const rawSharedNotesArg = fastData.shared
            ? fastData.shared
            : rawSharedNotes;

        console.log("FAST DATA: ", fastData);

        setFilter(filter);

        // filter if fastData of other notes was not given (prevent filtering of my and shared with partial fast data)
        if (filter === "All") {
            if (!fastData.shared) {
                setFilteredNotes(rawNotesArg);
                setNotes(rawNotesArg);
            }
            if (!fastData.my) {
                setSharedFilteredNotes(rawSharedNotesArg);
                setSharedNotes(rawSharedNotesArg);
            }
        } else {
            if (!fastData.shared) {
                setFilteredNotes(
                    rawNotesArg.filter((note) => note.category === filter)
                );
                setNotes(
                    rawNotesArg.filter((note) => note.category === filter)
                );
            }

            if (!fastData.my) {
                setSharedFilteredNotes(
                    rawSharedNotesArg.filter((note) => note.category === filter)
                );
                setSharedNotes(
                    rawSharedNotesArg.filter((note) => note.category === filter)
                );
            }
        }

        setNotesSearchText("");
    };

    // search notes
    const searchNotes = (searchQuery) => {
        console.log(`search = ${searchQuery}`);
        console.log("this is the filtered notes i received: ", filteredNotes);

        if (searchQuery.length === 0) {
            console.log("search = EXITING: empty search, returning");
            setNotes(filteredNotes);
            setSharedNotes(sharedFilteredNotes);
            return;
        }
        setNotes(
            filteredNotes.filter((note) => {
                if (note.name.length < searchQuery) {
                    return false;
                }
                console.log(
                    `ATTEMPTING VERGELYK "${note.name
                        .slice(0, searchQuery.length)
                        .toLowerCase()}" with "${searchQuery.toLowerCase()}"`
                );
                return (
                    note.name.slice(0, searchQuery.length).toLowerCase() ===
                    searchQuery.toLowerCase()
                );
            })
        );
        setSharedNotes(
            sharedFilteredNotes.filter((note) => {
                if (note.name.length < searchQuery) {
                    return false;
                }

                return (
                    note.name.slice(0, searchQuery.length).toLowerCase() ===
                    searchQuery.toLowerCase()
                );
            })
        );
    };

    // update state and trigger search
    const handleNotesSearchChange = (e) => {
        setNotesSearchText(e.target.value);
        searchNotes(e.target.value);
    };
    // Delete file
    const deleteFile = async (file) => {
        try {
            // Delete locally
            const newNotes = notes.filter((n) => n.id !== file.id);
            setNotes(newNotes);

            const response = await fetch(
                `https://anvil-backend-rutl.onrender.com/api/note/delete/${file.id}`,
                {
                    method: "DELETE",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                console.log("Note deleted");
            } else {
                console.error("Failed to delete the note.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    // GET users thats not invited to a note
    const fetchUsersThatIsNotInvited = async (noteId) => {
        try {
            const response = await fetch(
                `https://anvil-backend-rutl.onrender.com/api/note/notshared/${noteId}`,
                {
                    method: "GET",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                const resData = await response.json();
                return resData.users;
            } else {
                console.error("Failed to fetch users that is not invited");
            }
        } catch (error) {
            console.error(`An error occured: ${error}`);
        }
    };

    // GET users thats are invited to a note
    const fetchUsersThatIsInvited = async (noteId) => {
        try {
            const response = await fetch(
                `https://anvil-backend-rutl.onrender.com/api/note/shared/${noteId}`,
                {
                    method: "GET",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                }
            );

            if (response.ok) {
                const resData = await response.json();
                return resData.users;
            } else {
                console.error("Failed to fetch users that is not invited");
            }
        } catch (error) {
            console.error(`An error occured: ${error}`);
        }
    };

    const leaveSharedNote = async (note) => {
        try {
            //remove locally
            const newSharedNotes = sharedNotes.filter((n) => n.id !== note.id);
            setSharedNotes(newSharedNotes);

            const noteData = {
                user: userDetails,
                ownerID: note.ownerid,
                note: note,
            };

            const response = await fetch(
                `https://anvil-backend-rutl.onrender.com/api/share/delete`,
                {
                    method: "DELETE",
                    type: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": getToken(),
                    },
                    body: JSON.stringify(noteData),
                }
            );

            if (response.ok) {
                const resData = await response.json();
                return resData.users;
            } else {
                console.error("Leave shared-file failed");
            }
        } catch (error) {
            console.error(`An error occured: ${error}`);
        }
    };

    const [rawUsersThatAreNotInvited, setRawUsersThatAreNotInvited] = useState(
        []
    );
    const [rawUsersThatAreInvited, setRawUsersThatAreInvited] = useState([]);
    const [usersThatAreNotInvited, setUsersThatAreNotInvited] = useState([]);
    const [usersThatAreInvited, setUsersThatAreInvited] = useState([]);
    const [panelIsLoading, setPanelIsLoading] = useState(false);
    useEffect(() => {
        setUserSearchText("");
        const getUsersIfPanelOpen = async () => {
            if (invitePanelState[0]) {
                setPanelIsLoading(true);
                try {
                    const users = await fetchUsersThatIsNotInvited(
                        invitePanelState[1].id
                    );
                    setRawUsersThatAreNotInvited(users);
                    setUsersThatAreNotInvited(users);
                } catch (error) {
                    console.error("Error fetching users:", error);
                    setPanelIsLoading(false);
                }
                try {
                    const users = await fetchUsersThatIsInvited(
                        invitePanelState[1].id
                    );
                    setRawUsersThatAreInvited(users);
                    setUsersThatAreInvited(users);
                } catch (error) {
                    console.error("Error fetching users:", error);
                    setPanelIsLoading(false);
                }

                setPanelIsLoading(false);
            }
        };

        getUsersIfPanelOpen();
    }, [invitePanelState]);

    const searchUsers = (value) => {
        // update search keyword
        setUserSearchText(value);

        // search both user panels
        setUsersThatAreInvited(
            rawUsersThatAreInvited.filter((user) => {
                if (user.username.length < value.length) {
                    return false;
                }
                return (
                    user.username.slice(0, value.length).toLowerCase() ===
                    value.toLowerCase()
                );
            })
        );
        setUsersThatAreNotInvited(
            rawUsersThatAreNotInvited.filter((user) => {
                if (user.username.length < value.length) {
                    return false;
                }
                return (
                    user.username.slice(0, value.length).toLowerCase() ===
                    value.toLowerCase()
                );
            })
        );
    };

    return (
        <div className="relative h-full w-full bg-base-300">
            {/* Hidden invite panel start */}
            {invitePanelState[0] && (
                <div
                    className="backdrop-blur-sm absolute flex items-center justify-center h-full w-full bg-base-300 bg-opacity-60 z-50"
                    onClick={() =>
                        setInvitePanelState([!invitePanelState, null])
                    }
                >
                    <div
                        className="pop-in rounded-lg flex flex-col bg-base-100 w-3/5 h-3/4 p-6 shadow-lg shadow-base-300"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="w-full flex flex-row items-center gap-3 px-3 py-1">
                            <div className="basis-1/3 flex justify-start items-center overflow-x-auto">
                                <div
                                    className="px-2 cursor-pointer py-2 text-lg font-bold rounded-md hover:bg-neutral"
                                    onClick={() =>
                                        setInvitePanelState([
                                            !invitePanelState,
                                            null,
                                        ])
                                    }
                                >
                                    {invitePanelState[1].name}
                                </div>
                            </div>
                            <div className="basis-1/3 flex justify-center items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Search for users..."
                                    className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus"
                                    value={userSearchText}
                                    onChange={(e) => {
                                        searchUsers(e.target.value);
                                    }}
                                />
                                <GoSearch
                                    size={26}
                                    className="hover:text-white hover:cursor-pointer active:text-opacity-60"
                                />
                            </div>
                            <div className="basis-1/3 flex justify-end items-center">
                                <GoX
                                    size={30}
                                    className="flex hover:text-white hover:cursor-pointer active:text-opacity-60"
                                    onClick={() =>
                                        setInvitePanelState([
                                            !invitePanelState,
                                            null,
                                        ])
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto w-full flex flex-row">
                            <div className="flex-grow overflow-y-auto w-full px-2 py-4">
                                <div className="flex flex-col items-center justify-center w-full h-full rounded-md bg-base-200">
                                    <p className="text-lg p-3 font-bold flex items-center justify-center gap-2">
                                        <span>
                                            <GoLink size={20} />
                                        </span>
                                        Invite Users
                                    </p>
                                    <div className="divider p-0 m-0 px-4 pb-4" />
                                    <div className="flex-grow overflow-y-auto w-full">
                                        {panelIsLoading === false ? (
                                            usersThatAreNotInvited.map(
                                                (inviteUser) => (
                                                    <UserInviteItem
                                                        key={inviteUser.id}
                                                        user={inviteUser}
                                                        file={
                                                            invitePanelState[1]
                                                        }
                                                        alreadyInvited={false}
                                                        invitedUsers={
                                                            usersThatAreInvited
                                                        }
                                                        setInvitedUsers={
                                                            setUsersThatAreInvited
                                                        }
                                                        notInvitedUsers={
                                                            usersThatAreNotInvited
                                                        }
                                                        setNotInvitedUsers={
                                                            setUsersThatAreNotInvited
                                                        }
                                                        rawUsersThatAreNotInvited={
                                                            rawUsersThatAreNotInvited
                                                        }
                                                        rawUsersThatAreInvited={
                                                            rawUsersThatAreInvited
                                                        }
                                                        setRawUsersThatAreNotInvited={
                                                            setRawUsersThatAreNotInvited
                                                        }
                                                        setRawUsersThatAreInvited={
                                                            setRawUsersThatAreInvited
                                                        }
                                                    />
                                                )
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="loading text-primary w-12 loading-spinner"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="divider divider-horizontal py-7" />
                            <div className="flex-grow overflow-y-auto w-full px-2 py-4">
                                <div className="flex flex-col items-center justify-center w-full h-full rounded-md bg-base-200">
                                    <p className="text-lg p-3 font-bold flex items-center justify-center gap-2">
                                        <span>
                                            <GoTrash size={20} />
                                        </span>
                                        Remove Users
                                    </p>
                                    <div className="divider p-0 m-0 px-4 pb-4" />
                                    <div className="flex-grow overflow-y-auto w-full">
                                        {panelIsLoading === false ? (
                                            usersThatAreInvited.map(
                                                (inviteUser) => (
                                                    <UserInviteItem
                                                        key={inviteUser.id}
                                                        user={inviteUser}
                                                        file={
                                                            invitePanelState[1]
                                                        }
                                                        alreadyInvited={true}
                                                        invitedUsers={
                                                            usersThatAreInvited
                                                        }
                                                        setInvitedUsers={
                                                            setUsersThatAreInvited
                                                        }
                                                        notInvitedUsers={
                                                            usersThatAreNotInvited
                                                        }
                                                        setNotInvitedUsers={
                                                            setUsersThatAreNotInvited
                                                        }
                                                        rawUsersThatAreNotInvited={
                                                            rawUsersThatAreNotInvited
                                                        }
                                                        rawUsersThatAreInvited={
                                                            rawUsersThatAreInvited
                                                        }
                                                        setRawUsersThatAreNotInvited={
                                                            setRawUsersThatAreNotInvited
                                                        }
                                                        setRawUsersThatAreInvited={
                                                            setRawUsersThatAreInvited
                                                        }
                                                    />
                                                )
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="loading text-primary w-12 loading-spinner"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Hidden invite panel end */}
            {/* Navbar-start */}
            <section
                className="w-full flex justify-center"
                style={{ height: navbarHeight }}
            >
                <div className="navbar m-4 bg-base-100 rounded-md">
                    <div className="flex-1 px-2">
                        <a className="btn btn-ghost normal-case text-3xl flex flex-row gap-3">
                            <GiAnvil size={30} />
                            ANVIL
                        </a>
                    </div>
                    <div className="flex-none">
                        <div className="dropdown dropdown-end">
                            <label
                                tabIndex="0"
                                className="flex flex-row gap-3 btn btn-ghost avatar group"
                            >
                                <span className="text-lg">
                                    {" "}
                                    Welcome, {userDetails.username}
                                </span>
                                <div className="avatar online">
                                    <div className="w-10 rounded-full">
                                        <img src={userDetails.avatar} />
                                    </div>
                                </div>
                            </label>
                            <ul
                                tabIndex="0"
                                className="menu menu-md dropdown-content mt-2 z-[1] shadow-lg shadow-base-200 bg-neutral rounded-box w-52"
                            >
                                <li>
                                    <Link to={`/profile`}>
                                        <GoPerson size={16} />
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link onClick={handleLogout}>
                                        <GoSignOut size={16} />
                                        Logout
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            {/* Navbar-end */}
            {/* Body-start */}
            <section className="flex flex-row" style={{ height: bodyHeight }}>
                {/* Sidebar-start */}
                <div
                    className="h-full px-4 pb-4"
                    style={{ width: sidebarWidth }}
                >
                    <div className="flex flex-col gap-1 h-full w-full rounded-md bg-base-100">
                        <div className="w-full px-4 pt-4">
                            <div className="tabs tabs-boxed">
                                <div
                                    className={`tab ${
                                        displayFilesState == "my_files"
                                            ? "tab-active"
                                            : ""
                                    } flex-1 flex flex-row gap-2`}
                                    onClick={() =>
                                        setDisplayFilesState("my_files")
                                    }
                                >
                                    <GoPerson size={20} />
                                    <p>My files</p>
                                </div>
                                <div
                                    className={`tab ${
                                        displayFilesState == "sharded_files"
                                            ? "tab-active"
                                            : ""
                                    } flex-1 flex flex-row gap-2`}
                                    onClick={() =>
                                        setDisplayFilesState("sharded_files")
                                    }
                                >
                                    <GoPeople size={20} />
                                    <p>Shared files</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-row gap-2 pt-4 px-4 items-center justify-center">
                            <input
                                type="text"
                                placeholder="Search for file..."
                                className="bg-base-200 rounded-md input w-full max-w-xs focus:outline-none focus:bg-neutral-focus"
                                value={notesSearchText}
                                onChange={(value) => {
                                    handleNotesSearchChange(value);
                                }}
                            />
                            {isASC ? (
                                <div className="tooltip" data-tip="Ascending">
                                    <GoArrowUp
                                        size={28}
                                        onClick={() => setIsASC(!isASC)}
                                        className="hover:text-white hover:cursor-pointer active:text-opacity-60"
                                    />
                                </div>
                            ) : (
                                <div className="tooltip" data-tip="Descending">
                                    <GoArrowDown
                                        size={28}
                                        onClick={() => setIsASC(!isASC)}
                                        className="hover:text-white hover:cursor-pointer active:text-opacity-60"
                                    />
                                </div>
                            )}
                            <div className="dropdown dropdown-end">
                                <label tabIndex="0" className="">
                                    <GoFilter
                                        size={30}
                                        className="hover:text-white hover:cursor-pointer active:text-opacity-60"
                                    />
                                </label>
                                <ul
                                    tabIndex="0"
                                    className="flex flex-row menu menu-md dropdown-content mt-2 z-[1] shadow-lg shadow-base-300 bg-neutral rounded-box w-56 h-56"
                                >
                                    <div className="w-full h-full overflow-y-auto">
                                        <li
                                            className="w-full"
                                            onClick={() => filterNotes("All")}
                                        >
                                            <span className="flex w-full">
                                                <div className="flex-1">
                                                    All
                                                </div>
                                                {filterState === "All" ? (
                                                    <GoCheck size={16} />
                                                ) : (
                                                    <></>
                                                )}
                                            </span>
                                        </li>
                                        <div className="divider m-0 p-0"></div>
                                        {categories &&
                                        Array.isArray(categories) ? (
                                            categories.map((category) => (
                                                <CategoryItem
                                                    key={category.id}
                                                    filterNotes={filterNotes}
                                                    categoryName={category.name}
                                                    filterState={filterState}
                                                />
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full p-2">
                                                <span className="loading w-5 loading-spinner text-primary"></span>
                                            </div>
                                        )}
                                    </div>
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 flex-1 overflow-hidden">
                            <div className="w-full h-full bg-base-200 rounded-md">
                                <div className="w-full h-full">
                                    {/* MY FILES START */}
                                    <div
                                        className={`w-full h-full flex flex-col gap-3 pop-in ${
                                            displayFilesState === "my_files"
                                                ? ""
                                                : "hidden"
                                        }`}
                                    >
                                        <div className="w-full h-full flex flex-col flex-nowrap bg-base-200 overflow-hidden rounded-md">
                                            <div className="flex w-full flex-1 flex-col p-2 overflow-y-auto">
                                                {notes ? (
                                                    notes.length === 0 ? (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            No notes have been
                                                            created yet.
                                                        </div>
                                                    ) : (
                                                        notes.map((note) => (
                                                            <FileItem
                                                                key={note.id}
                                                                file={note}
                                                                activateNote={
                                                                    activateNote
                                                                }
                                                                onLinkClick={
                                                                    setInvitePanelState
                                                                }
                                                                onDeleteClick={
                                                                    deleteFile
                                                                }
                                                                isOwner={true}
                                                                leaveSharedNote={
                                                                    leaveSharedNote
                                                                }
                                                            />
                                                        ))
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full p-2">
                                                        <span className="loading w-8 loading-spinner text-primary"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="divider m-0 p-2"></div>
                                        <div className="flex flex-row gap-3 items-center justify-center px-4 pb-4">
                                            <div className="dropdown dropdown-top">
                                                <label
                                                    tabIndex="0"
                                                    className=""
                                                >
                                                    <GoTag
                                                        size={20}
                                                        className="hover:text-white hover:cursor-pointer active:text-opacity-60"
                                                    />
                                                </label>
                                                <ul
                                                    tabIndex="0"
                                                    className="flex flex-row menu menu-md dropdown-content mt-2 z-[1] shadow-lg shadow-base-300 bg-neutral rounded-box w-56 h-60"
                                                >
                                                    <div className="flex flex-col w-full h-full">
                                                        <div className="w-full overflow-y-auto">
                                                            {categories &&
                                                            Array.isArray(
                                                                categories
                                                            ) ? (
                                                                categories.map(
                                                                    (
                                                                        category
                                                                    ) => (
                                                                        <li
                                                                            className="w-full"
                                                                            onClick={() =>
                                                                                setCategory(
                                                                                    category.name
                                                                                )
                                                                            }
                                                                        >
                                                                            <span className="flex w-full">
                                                                                <div className="flex-1">
                                                                                    {
                                                                                        category.name
                                                                                    }
                                                                                </div>
                                                                                {categoryState ===
                                                                                category.name ? (
                                                                                    <GoCheck
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <>

                                                                                    </>
                                                                                )}
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                )
                                                            ) : (
                                                                <div className="flex items-center justify-center w-full h-full p-2">
                                                                    <span className="loading w-5 loading-spinner text-primary"></span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Add new category */}
                                                        <div className="w-full divider m-0 p-0 mt-2"></div>
                                                        <div className="flex flex-row gap-2 items-center justify-center p-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Add category..."
                                                                className="input input-sm w-full max-w-xs bg-neutral focus:outline-none focus:bg-neutral-focus"
                                                                value={
                                                                    newCategory
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setNewCategory(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                }}
                                                            />
                                                            {addingCategory ? (
                                                                <span className="loading loading-spinner loading-sm"></span>
                                                            ) : (
                                                                <GoPlus
                                                                    size={26}
                                                                    className="hover:text-white hover:cursor-pointer active:text-opacity-60"
                                                                    onClick={() => {
                                                                        addCategory(
                                                                            newCategory
                                                                        );
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </ul>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter file name..."
                                                className="input w-full max-w-xs bg-base-100 focus:outline-none focus:bg-neutral-focus"
                                                value={noteName}
                                                onChange={handleNoteNameChange}
                                            />
                                            {isCreatingNote ? (
                                                <span className="loading loading-spinner w-7"></span>
                                            ) : (
                                                <GoPlusCircle
                                                    size={30}
                                                    onClick={createNote}
                                                    className="hover:text-white hover:cursor-pointer active:text-opacity-60"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {/* SHARED FILES START */}
                                    <div
                                        className={`pop-in h-full w-full ${
                                            displayFilesState === "my_files"
                                                ? "hidden"
                                                : ""
                                        }`}
                                    >
                                        <div className="h-full w-full flex-nowrap rounded-md">
                                            <div className="flex flex-col p-2 h-full w-full overflow-y-auto">
                                                {sharedNotes ? (
                                                    sharedNotes.length === 0 ? (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            No notes have been
                                                            <br />
                                                            shared with you yet.
                                                        </div>
                                                    ) : (
                                                        sharedNotes.map(
                                                            (note) => (
                                                                <FileItem
                                                                    key={
                                                                        note.id
                                                                    }
                                                                    file={note}
                                                                    activateNote={
                                                                        activateNote
                                                                    }
                                                                    onLinkClick={
                                                                        setInvitePanelState
                                                                    }
                                                                    isOwner={
                                                                        false
                                                                    }
                                                                    leaveSharedNote={
                                                                        leaveSharedNote
                                                                    }
                                                                />
                                                            )
                                                        )
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full p-2">
                                                        <span className="loading w-8 loading-spinner text-primary"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sidebar-end */}
                {/* Content-start */}
                <div className="h-full pr-4 pb-4" style={{ width: bodyWidth }}>
                    <div className="h-full w-full flex flex-col rounded-md bg-base-100">
                        {/* components-start */}
                        <div className="px-6 pt-4 flex items-center justify-items-center w-full">
                            <div className="flex basis-1/3 h-full items-center justify-start overflow-x-auto">
                                <h3 key={activeNote.id} className="pop-in">
                                    {activeNote.name}
                                </h3>
                            </div>
                            <div className="flex basis-1/3 justify-center">
                                <div className="tabs tabs-boxed">
                                    <div
                                        className={`tab tooltip tooltip-primary ${
                                            markupViewState == "markup_view"
                                                ? "tab-active"
                                                : ""
                                        } flex-1 flex flex-row gap-2`}
                                        data-tip="Markup-View"
                                        onClick={() =>
                                            setMarkupViewState("markup_view")
                                        }
                                    >
                                        <BsCodeSlash size={23} />
                                    </div>
                                    <div
                                        className={`tab tooltip tooltip-primary ${
                                            markupViewState == "reader_view"
                                                ? "tab-active"
                                                : ""
                                        } flex-1 flex flex-row gap-2`}
                                        data-tip="Reader-View"
                                        onClick={() =>
                                            setMarkupViewState("reader_view")
                                        }
                                    >
                                        <GoTypography size={23} />
                                    </div>
                                    <div
                                        className={`tab tooltip tooltip-primary ${
                                            markupViewState == "combination"
                                                ? "tab-active"
                                                : ""
                                        } flex-1 flex flex-row gap-2`}
                                        data-tip="Markup-View & Reader-View"
                                        onClick={() =>
                                            setMarkupViewState("combination")
                                        }
                                    >
                                        <BsSquareHalf size={23} />
                                    </div>
                                </div>
                            </div>
                            <button className="flex justify-end basis-1/3">
                                <div className="flex-none">
                                    <div className="dropdown dropdown-end">
                                        <label tabIndex="0">
                                            <div className="btn-primary p-2.5 rounded-md">
                                                <GoPeople
                                                    className="flex"
                                                    size={25}
                                                />
                                            </div>
                                        </label>
                                        <ul
                                            tabIndex="0"
                                            className="flex-nowrap menu menu-md dropdown-content mt-2 z-[1] shadow-lg shadow-base-200 bg-neutral rounded-box max-h-[50vh] w-80"
                                        >
                                            <div className="flex w-full items-center justify-center font-bold text-lg py-1">
                                                Working on file
                                            </div>
                                            <div className="divider m-0 p-0 mx-4"></div>
                                            <div className="flex-1 overflow-y-auto w-full">
                                                {currentlyEditing.map(
                                                    (user) => (
                                                        <li>
                                                            <UserPorfileItem
                                                                name={
                                                                    user.username
                                                                }
                                                                avatar={
                                                                    user.avatar
                                                                }
                                                            />
                                                        </li>
                                                    )
                                                )}
                                            </div>
                                        </ul>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <MarkdownEditor
                            markupViewStateInput={markupViewState}
                            activeNote={activeNote}
                            socket={socket}
                        />

                        {/* components-end */}
                    </div>
                </div>
                {/* Content-end */}
            </section>
            {/* Body-end */}
        </div>
    );
}

export default Home;
