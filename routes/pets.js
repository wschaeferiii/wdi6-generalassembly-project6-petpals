var express = require('express');
var petsRouter = express.Router();
var Pet = require("../models/pet");
var Post = require('../models/post');


function makeError(res, message, status) {
  res.statusCode = status;
  var error = new Error(message);
  error.status = status;
  return error;
}

function authenticate(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
  } else {
    next();
  }
}

// INDEX CURRENT USER PETS
petsRouter.get('/', function(req, res, next) {
  var pets = global.currentUser.pets;
  res.render('pets/index', { pets: pets, message: req.flash() });
});

// NEW PET
petsRouter.get('/new', function(req, res, next) {
  var pet = {
    name: '',
    type: '',
    breed: '',
    gender: '',
    age: '',
    bio: '',
    profilePicture: ''
  };
  res.render('pets/new', { pet: pet });
});

// SHOW PET
petsRouter.get('/:id', function(req, res, next) {
  var pet = currentUser.pets.id(req.params.id);
  console.log(pet);
  console.log(pet._id);
  if (!pet) return next(makeError(res, 'Document not found', 404));
  return Post.find({pet: pet._id}).populate('pet')
  .then(function(posts) {
    // console.log(posts);
    // console.log(posts[0].pet._id);
  res.render('pets/show', { posts: posts, pet: pet,  message: req.flash() });
 })
});

// CREATE PET
petsRouter.post('/', function(req, res, next) {
  var pet = new Pet ({
    name: req.body.name,
    type: req.body.type,
    breed: req.body.breed,
    gender: req.body.gender,
    age: req.body.age,
    bio: req.body.bio,
    profilePicture: req.body.profilePicture
  });
  pet.save()
  console.log("pushing pet to current user")
  currentUser.pets.push(pet);
  console.log('saving pet to user');
  currentUser.save()
  .then(function() {
    res.redirect('/pets');
  }, function(err) {
      return next(err);
    });
});

// EDIT PET
petsRouter.get('/:id/edit', function(req, res, next) {
  var pet = currentUser.pets.id(req.params.id);
  if (!pet) return next(makeError(res, 'Document not found', 404));
  res.render('pets/edit', { pet: pet, message: req.flash() });
});

// UPDATE PET
petsRouter.put('/:id', function(req, res, next) {
  var pet = currentUser.pets.id(req.params.id);
  if (!pet) return next(makeError(res, 'Document not found', 404));
  else {
    pet.name = req.body.name;
    pet.type = req.body.type;
    pet.breed = req.body.breed;
    pet.gender = req.body.gender;
    pet.age = req.body.age;
    pet.bio = req.body.bio;
    pet.profilePicture = req.body.profilePicture;
    currentUser.save()
    .then(function(saved) {
      res.redirect('/pets');
    }, function(err) {
      return next(err)
    });
  }
});

// DESTROY PET
petsRouter.delete('/:id', function(req,res,next) {
  var pet = currentUser.pets.id(req.params.id);
  if (!pet) return next(makeError(res, 'Document not found', 404));
  var index = currentUser.pets.indexOf(pet);
  currentUser.pets.splice(index, 1);
  // console.log(pet);
  currentUser.save()
  .then(function(saved) {
    console.log("Hello World!");
    console.log(req.params.id);
    // return Post.find({ pet: req.params.id });
    return Post.remove({ pet: req.params.id });
  })
  .then(function() {
    return Pet.findByIdAndRemove(req.params.id);
  })
  .then(function(){
    // console.log(post);
   res.redirect('/pets');
 }, function(err) {
  return next(err);
  });
});


module.exports = petsRouter;
