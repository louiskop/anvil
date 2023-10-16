const { Pool } = require("pg");
require("dotenv").config();

const { DATABASE_URL } = process.env;

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Users functions
module.exports.getAllUsers = async () => {
    return await pool.query("SELECT * FROM users");
};

module.exports.getOneUserByUsername = async (username) => {
    return await pool.query(
        `SELECT * FROM users WHERE username = '${username}'`
    );
};

module.exports.getOneUserByEmail = async (email) => {
    return await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
};

module.exports.createUser = async (user) => {
    return await pool.query(
        `INSERT INTO users (username, password, email, avatar, confirmed) VALUES ('${user.username}', '${user.password}', '${user.email}', '${user.avatar}', ${user.confirmed})`
    );
};

module.exports.updateUser = async (user) => {
    return await pool.query(
        `UPDATE users SET username='${user.username}' , password='${user.password}', email='${user.email}', avatar='${user.avatar}' WHERE id=${user.id}`
    );
};

//delete user
module.exports.deleteUser = async (username) => {
    return await pool.query(`DELETE FROM users WHERE username='${username}'`);
};

//delete all notes by user
module.exports.deleteAllNotesByUser = async (id) => {
    return await pool.query(`DELETE FROM notes WHERE ownerid=${id}`);
};

//delete shared notes by user
module.exports.deleteShared = async (id) => {
    await pool.query(`DELETE FROM shared WHERE owner_id=${id}`);
    await pool.query(`DELETE FROM shared WHERE sharedwith=${id}`);
};

// Notes functions
module.exports.getAllNotes = async () => {
    return await pool.query("SELECT * FROM notes");
};

module.exports.getOneNote = async (id) => {
    return await pool.query(`SELECT * FROM notes WHERE id = ${id}`);
};

module.exports.getMyNotes = async (id) => {
    return await pool.query(`SELECT * FROM notes WHERE ownerid = ${id}`);
};

module.exports.createNote = async (note) => {
    return await pool.query(
        `INSERT INTO notes (name, content, category, createdat, updatedat, ownerid) VALUES ('${note.name}', '${note.content}', '${note.category}', '${note.createdat}','${note.updatedat}', ${note.ownerid})`
    );
};

module.exports.deleteNote = async (id) => {
    return await pool.query(`DELETE FROM notes WHERE id=${id}`);
};

module.exports.updateNote = async (note) => {
    return await pool.query(
        `UPDATE notes SET name='${note.name}', content='${note.content}', category='${note.category}', updatedat='${note.updatedat}' WHERE id=${note.id}`
    );
};

// Shared functions
module.exports.getAllShared = async () => {
    return await pool.query("SELECT * FROM shared");
};

module.exports.getSharedWithNotes = async (id) => {
    var noteIds = await pool.query(
        `SELECT note_id FROM shared WHERE sharedWith = ${id}`
    );

    noteIds = noteIds.rows;
    noteIds = noteIds.map((note) => note.note_id);

    // check if no shared notes exist
    if (noteIds.length === 0) {
        return [];
    }

    return await pool.query(
        `SELECT * FROM notes WHERE id IN (${noteIds.join(",")})`
    );
};

module.exports.shareNote = async (note) => {
    return await pool.query(
        `INSERT INTO shared (note_id, sharedWith, owner_id) VALUES (${note.noteId}, ${note.shareWith}, ${note.ownerId})`
    );
};

module.exports.deleteSharedByNoteId = async (noteId) => {
    return await pool.query(`DELETE FROM shared WHERE note_id=${noteId}`);
};

module.exports.deleteSharedByNoteIdAndUserId = async (noteId, userId) => {
    return await pool.query(
        `DELETE FROM shared WHERE note_id=${noteId} AND sharedWith=${userId}`
    );
};

module.exports.allUsersThatIsNotSharedWithNoteId = async (userID, noteId) => {
    var users = await pool.query(
        `SELECT * FROM users WHERE id NOT IN (SELECT sharedWith FROM shared WHERE note_id = ${noteId}) AND id != ${userID}`
    );
    return users.rows;
};

module.exports.allUsersThatIsSharedWithNoteId = async (userID, noteId) => {
    var users = await pool.query(
        `SELECT * FROM users WHERE id IN (SELECT sharedWith FROM shared WHERE note_id = ${noteId}) AND id != ${userID}`
    );
    return users.rows;
};

//Categories

//get all
module.exports.getAllCategories = async () => {
    return await pool.query("SELECT * FROM categories");
};

//add categories
module.exports.createCategory = async (categoryName) => {
    try {
        var add = await pool.query(
            `INSERT INTO categories (name) VALUES ('${categoryName}')`
        );
    } catch (error) {
        console.log(error);
    }
    return add;
};

module.exports.getNoteContent = async (noteid) => {
    result = await pool.query(
        `SELECT content FROM notes WHERE id = ${parseInt(noteid)}`
    );
    return result.rows[0].content;
};

module.exports.updateNoteContent = async (noteid, content) => {
    await pool.query(
        `UPDATE notes SET content='${content}' WHERE id=${noteid}`
    );
};

module.exports.updateUserPassword = async (userid, password) => {
    await pool.query(
        `UPDATE users SET password='${password}' WHERE id=${userid}`
    );
};

module.exports.confirmUser = async (userId) => {
    await pool.query(`UPDATE users SET confirmed=true WHERE id=${userId}`);
};
