const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');

//Bring in Article Model
let Article = require('../models/article');
//User Model
let User = require('../models/user');

//Add Route
router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Add submit POST Route
router.post('/add', [
    check('title', 'Title is required').not().isEmpty(),
    // check('author', 'Author is required').not().isEmpty(),
    check('body', 'Body is required').not().isEmpty(),
], function (req, res) {

    let errors = validationResult(req);
    // console.log(errors);
    //get Errors
    // let errors= req.validationErrors();
    if (!errors.isEmpty()) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors.array()
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        article.save(function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }


});

//Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        } else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            });
        }
    });
});

//Update Submit POST Route
router.post('/edit/:id', function (req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    let query = {_id: req.params.id};

    Article.update(query, article, function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});
// Delete Article
router.delete('/:id', function (req, res) {
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id: req.params.id};
    Article.findById(req.params.id, function(err, article){
        if(article.author!=req.user._id){
            res.status(500).send();
        } else {
            Article.remove(query, function (err) {
                if (err) {
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });

});
//Get Single Article
router.get('/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        User.findById(article.author, function (err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });

    });
});

//Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please Login');
        res.redirect('/users/login');
    }
}

module.exports = router;