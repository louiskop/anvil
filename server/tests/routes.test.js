const request = require("supertest");
const app = require("../index");

describe("User tests", () => {
    var authToken;

    test("Login", async () => {
        const res = await request(app).post("/api/user/login").send({
            username: "louis",
            password: "louis",
        });

        expect(res.statusCode).toBe(200);
        authToken = res.body.token;
    }, 10000);

    test("Create a note", async () => {
        const res = await request(app)
            .post("/api/note/create")
            .set({ "auth-token": authToken })
            .send({
                name: "TestNote",
                content: "This is a test note",
                category: "Work",
            });

        expect(res.statusCode).toBe(200);
    }, 10000);
}, 10000);
