const express = require("express");
const router = express.Router();
const auth = require("../auth/verifyToken");
const { getAllCategories, createCategory } = require("../queries");

//get all categories
router.get("/", async (req, res) => {
    const allCategories = await getAllCategories();
    res.status(200).json({ message: allCategories.rows });
});

//Add category
router.post("/add", auth, async (req, res) => {
    const name = req.body.name;
    const category = await createCategory(name);
    if (category) {
        res.status(200).json({ message: "Category added" });
    } else {
        res.status(500).json({ message: "Error adding category" });
    }
});

module.exports.categoryRoutes = router;
