const express = require("express");
const router = express.Router();
const auth = require("../auth/verifyToken");
const {
    getAllNotes,
    getOneNote,
    getMyNotes,
    createNote,
    deleteSharedByNoteId,
    deleteNote,
    updateNote,
    allUsersThatIsNotSharedWithNoteId,
    allUsersThatIsSharedWithNoteId,
} = require("../queries");

// DONE: get all notes
router.get("/", auth, async (req, res) => {
    const allNotes = await getAllNotes();
    res.status(200).json({ message: allNotes.rows });
});

// DONE: Get one note
router.get("/:id", auth, async (req, res) => {
    const id = req.params.id;
    const note = await getOneNote(id);
    if (note) {
        res.status(200).json(note.rows[0]);
    } else {
        res.status(404).json({ message: "Note not found" });
    }
});

// DONE: Get my notes
router.get("/my/notes", auth, async (req, res) => {
    const id = req.user.id;
    const notes = await getMyNotes(id);
    var sortedNotes = [];
    if (notes) {
        if (notes.rows.length > 0) {
            // sort notes
            sortedNotes = notes.rows.sort((a, b) => b - a);
        }
        res.status(200).json(sortedNotes);
    } else {
        res.status(404).json({ message: "Note not found" });
    }
});

// DONE: Delete Note
router.delete("/delete/:id", auth, async (req, res) => {
    const id = req.user.id;
    const noteId = req.params.id;
    const note = await getOneNote(noteId);
    if (note.rows.length > 0) {
        if (note.rows[0].ownerid == id) {
            await deleteSharedByNoteId(noteId);
            await deleteNote(noteId);
            res.status(200).json({ message: "Note deleted" });
        } else {
            res.status(403).json({ message: "You do not own this note" });
        }
    } else {
        res.status(404).json({ message: "Note not found" });
    }
});

// DONE: Create Note
router.post("/create", auth, async (req, res) => {
    const name = req.body.name;
    const content = req.body.content;
    const category = req.body.category;

    var date = new Date().getTime();
    const createdAt = date;
    const updatedAt = date;
    const ownerID = req.user.id;
    await createNote({
        name: name,
        content: content,
        category: category,
        createdat: createdAt,
        updatedat: updatedAt,
        ownerid: ownerID,
    });
    res.status(200).json({ message: "Note created" });
});

// DONE: Update Note
router.put("/update/:id", auth, async (req, res) => {
    const noteId = req.params.id;
    const note = await getOneNote(noteId);
    const ownerId = req.user.id;

    // TODO: send realitime updates over sockets

    if (note.rows.length > 0) {
        await updateNote({
            id: noteId,
            name: req.body.name ? req.body.name : note.rows[0].name,
            content: req.body.content ? req.body.content : note.rows[0].content,
            category: req.body.category
                ? req.body.category
                : note.rows[0].category,
            updatedat: new Date().getTime(),
        });
        res.status(200).json({ message: "Note updated" });
    } else {
        res.status(404).json({ message: "Note not found" });
    }
});

// DONE: Get all users who are not shared with a specific note
router.get("/shared/:noteId", auth, async (req, res) => {
    const noteId = req.params.noteId;
    try {
        const usersNotShared = await allUsersThatIsSharedWithNoteId(
            req.user.id,
            noteId
        );
        res.status(200).json({ users: usersNotShared });
    } catch (error) {
        console.error("Error getting users not shared with the note:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DONE: Get all users who are shared with a specific note
router.get("/notshared/:noteId", auth, async (req, res) => {
    const noteId = req.params.noteId;
    try {
        const usersShared = await allUsersThatIsNotSharedWithNoteId(
            req.user.id,
            noteId
        );
        res.status(200).json({ users: usersShared });
    } catch (error) {
        console.error("Error getting users shared with the note:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports.noteRoutes = router;
