const server = require("./index");
const PORT = process.env.PORT || 3001;

// listen
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
