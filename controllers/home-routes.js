const router = require('express').Router();
const { Post, User, Comment } = require('../models');
const thisAuth = require("../utils/auth");

router.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/");
    } else {
        res.render("login");
    }
});

router.get("/", async (req, res) => {
    console.log("get posts");
    try {
        const postData = await Post.findAll({
            include: [{
                model: User,
                attributes: ["name"]
            }]
        });

        const posts = postData.map((post) =>
            post.get({ plain: true })
        );

        res.render("homepage", {
            posts,
            loggedIn: req.session.loggedIn
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get("/post/:id", async (req, res) => {
    if (req.session.loggedIn === false) {
        res.redirect("/login");
    } else {
        try {
            const postData = await Post.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        attributes: ["name"]
                    },
                    {
                        model: Comment,
                        include: {
                            model: User,
                            attributes: ["name"]
                        }
                    },
                ],
            });

            if (postData) {
                const post = postData.get({ plain: true });
                res.render("viewpost", {
                    post,
                    loggedIn: req.session.loggedIn
                });
            } else {
                res.status(404).json({ message: "Not found" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    }
});

module.exports = router;
