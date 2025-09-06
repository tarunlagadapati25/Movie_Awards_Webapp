const express=require('express')
const controller=require('../controller/eventController')
const router=express.Router();
const {fileUpload} = require('../middleware/fileUpload');
const {isLoggedIn, isHost, isNotHost} = require('../middleware/auth')
const { validateId, validateResult, validateRSVP } = require('../middleware/validator');


//get /events
router.get('/',controller.index)

//get /events/bookahall
router.get('/bookahall',isLoggedIn,controller.new)

//post /events/create
router.post('/',isLoggedIn, validateResult, fileUpload, controller.create)

//get /events/:id
router.get('/:id',validateId, controller.show)

//get /events/:id/edit
router.get('/:id/edit',validateId, isLoggedIn, isHost, controller.edit)

//put /events/:id
router.put('/:id',validateId, isLoggedIn, isHost, validateResult,controller.update)

//delete /events/:id
router.delete('/:id',validateId, isLoggedIn, isHost, controller.delete);

router.post('/:id/rsvp', validateId, isLoggedIn, isNotHost, validateRSVP, validateResult, controller.editRsvp);

module.exports = router;