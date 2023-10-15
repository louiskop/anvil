const express = require("express");
const router = express.Router();
const { mockNotes } = require("./note");
const auth = require("../auth/verifyToken");
const {
    getAllShared,
    getSharedWithNotes,
    getOneNote,
    getOneUserByUsername,
    shareNote,
    deleteSharedByNoteIdAndUserId,
} = require("../queries");

// DONE: get shared notes
router.get("/", auth, async (req, res) => {
    const allShared = await getAllShared();
    res.status(200).json({ message: allShared });
});

// DONE: notes shared with me
router.get("/my/sharedNotes", auth, async (req, res) => {
    const id = req.user.id;
    var notes = await getSharedWithNotes(id);
    var sharedNotes = [];
    if (req.user.username === "scooby") {
        console.log(
            "THE NOTES IS ",
            notes,
            " THE TYPE OF NOTES IS ",
            typeof notes
        );
    }
    if (notes.rows) {
        if (notes.rows.length > 0) {
            sharedNotes = notes.rows.sort((a, b) => b - a);
        }
        res.status(200).json({ message: sharedNotes });
    } else {
        res.status(200).json({ message: sharedNotes });
    }
});

// DONE: Share notes
router.post("/", auth, async (req, res) => {
    const noteId = req.body.noteId;
    const ownerId = req.user.id;
    var shareWith = await getOneUserByUsername(req.body.shareWith);

    shareWith = shareWith.rows[0].id;
    const note = await getOneNote(noteId);
    if (note.rows.length > 0) {
        if (note.rows[0].ownerid == ownerId) {
            await shareNote({
                noteId: noteId,
                ownerId: ownerId,
                shareWith: shareWith,
            });
            res.status(200).json({ message: "Note shared" });
        } else {
            res.status(403).json({
                message: "You are not the owner of this note",
            });
        }
    } else {
        res.status(404).json({ message: "Note not found" });
    }
});

// TODO: Delete a note-share
router.delete("/delete", auth, async (req, res) => {
    const noteId = req.body.noteId;
    var shareWith = req.body.shareWith;

    const note = await getOneNote(noteId);
    if (note.rows.length > 0) {
        await deleteSharedByNoteIdAndUserId(noteId, shareWith);
        res.status(200).json({ message: "Note share deleted" });
    } else {
        res.status(404).json({ message: "Note not found" });
    }
});

module.exports = router;
