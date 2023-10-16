const { Pool } = require("pg");
require("dotenv").config();

const { DATABASE_URL } = process.env;

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

function sanitizeNames(text) {
    text = text.replace(/<[^>]*>/g, "");
    text = text.replace(/'/g, "''");
    return text;
}

function sanitizeNotesContent(text) {
    text = text.replace(/'/g, "''");
    return text;
}

function undoSanitizeNotes(text) {
    if (text.includes("''")) {
        text = text.replace(/''/g, "'");
    }
    return text;
}

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
    const query = {
        text: "INSERT INTO users (username, password, email, avatar, confirmed) VALUES ($1, $2, $3, $4, $5)",
        values: [
            sanitizeNames(user.username),
            sanitizeNames(user.password),
            sanitizeNames(user.email),
            sanitizeNames(user.avatar),
            user.confirmed,
        ],
    };

    try {
        const result = await pool.query(query);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports.updateUser = async (user) => {
    const sanitizedUsername = sanitizeNames(user.username);
    const sanitizedPassword = sanitizeNames(user.password);
    const sanitizedEmail = sanitizeNames(user.email);
    const sanitizedAvatar = sanitizeNames(user.avatar);

    // Use parameterized queries to prevent SQL injection
    const query = {
        text: `UPDATE users SET username = $1, password = $2, email = $3, avatar = $4 WHERE id = $5`,
        values: [
            sanitizedUsername,
            sanitizedPassword,
            sanitizedEmail,
            sanitizedAvatar,
            user.id,
        ],
    };

    try {
        const result = await pool.query(query);
        return result;
    } catch (error) {
        throw error;
    }
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
    const sanitizedContent = sanitizeNotesContent(note.content);

    return await pool.query(
        `INSERT INTO notes (name, content, category, createdat, updatedat, ownerid) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            sanitizeNames(note.name),
            sanitizedContent,
            sanitizeNames(note.category),
            note.createdat,
            note.updatedat,
            note.ownerid,
        ]
    );
};

module.exports.deleteNote = async (id) => {
    return await pool.query(`DELETE FROM notes WHERE id=${id}`);
};

module.exports.updateNote = async (note) => {
    const sanitizedContent = sanitizeNotesContent(note.content);

    // Use parameterized queries to prevent SQL injection
    const query = {
        text: `UPDATE notes SET name = $1, content = $2, category = $3, updatedat = $4 WHERE id = $5`,
        values: [
            note.name,
            sanitizedContent,
            note.category,
            note.updatedat,
            note.id,
        ],
    };

    try {
        const result = await pool.query(query);
        return result;
    } catch (error) {
        throw error;
    }
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
    const sanitizedCategoryName = sanitizeNames(categoryName);
    try {
        var add = await pool.query(
            `INSERT INTO categories (name) VALUES ($1)`,
            [sanitizedCategoryName]
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
    const sanitizedContent = sanitizeNotesContent(content);

    await pool.query(`UPDATE notes SET content=$1 WHERE id=$2`, [
        sanitizedContent,
        noteid,
    ]);
};

module.exports.updateUserPassword = async (userid, password) => {
    const sanitizedPassword = sanitizeNames(password);

    await pool.query(`UPDATE users SET password=$1 WHERE id=$2`, [
        sanitizedPassword,
        userid,
    ]);
};

module.exports.confirmUser = async (userId) => {
    await pool.query(`UPDATE users SET confirmed=true WHERE id=${userId}`);
};
