// server config
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

// TODO: also move with other socket code
const { getNoteContent, updateNoteContent } = require("./queries");

// configure environment vars
require("dotenv").config();

// import routes
const userRoutes = require("./routes/user");
const { noteRoutes } = require("./routes/note");
const shareRoutes = require("./routes/share");
const { categoryRoutes } = require("./routes/category");

// use routes
app.use(cors());
app.use(bodyParser.json());
app.use("/api/user/", userRoutes);
app.use("/api/note/", noteRoutes);
app.use("/api/share/", shareRoutes);
app.use("/api/category/", categoryRoutes);

// create server with http and socket.io
const server = http.createServer(app);

// create websocket io server
const io = new Server(server, {
    cors: {
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

// TODO: extract listeners to own file?

// store all noteId's with currently editing users
noteRooms = {};

// store all noteId's with latest content version
noteContents = {};

// handle user connect
io.on("connection", (socket) => {
    console.log(`User connected with socketId: ${socket.id}`);

    // connected socket eventlisteners here

    // join a note
    socket.on("join_note", async ({ noteId, userDetails }) => {
        // join this note's channel
        socket.join(noteId);

        // store this user in noteroom
        if (noteRooms[noteId]) {
            noteRooms[noteId].push(userDetails);
        } else {
            noteRooms[noteId] = [userDetails];
        }

        // send list of editors to all users in room (except self)
        socket.to(noteId).emit("editors", {
            users: noteRooms[noteId],
        });
        // send list of editors to self
        socket.emit("editors", {
            users: noteRooms[noteId],
        });

        // if first in noteroom , get data from db
        if (noteRooms[noteId].length == 1) {
            console.log("first in noteroom , getting data from db");
            noteContents[noteId] = await getNoteContent(noteId);
        }

        // send current note state to self
        let updatedContent = noteContents[noteId];
        socket.emit("push_update", { noteId, updatedContent });

        console.log(noteRooms);
    });

    // edit note
    socket.on("update_note", ({ noteId, updatedContent }) => {
        console.log("Received updated note content: ", updatedContent);

        // send updated note to all editors
        socket.to(noteId).emit("push_update", { noteId, updatedContent });

        // send updated note back to myself
        socket.emit("push_update", { noteId, updatedContent });

        // store updated note as latest version
        noteContents[noteId] = updatedContent;
    });

    // leave note room
    socket.on("leave_note", async ({ noteId, userDetails }) => {
        // remove user from room storage
        noteRooms[noteId] = noteRooms[noteId].filter((userDetail) => {
            return userDetail.id !== userDetails.id;
        });

        // send new list of editors to all users in room (except self)
        socket.to(noteId).emit("editors", {
            users: noteRooms[noteId],
        });

        // leave socket room
        socket.leave(noteId);

        // store note on database if last person left
        if (noteRooms[noteId].length == 0) {
            console.log("Last person left, storing on the db ...");
            await updateNoteContent(noteId, noteContents[noteId]);
        }
    });
});

module.exports = server;
