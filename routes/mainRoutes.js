const express=require('express')
const controller=require('../controller/mainController')
const router=express.Router();

//get /home
router.get('/',controller.index)

//get /about
router.get('/about',controller.about)

//get /contact
router.get('/contact',controller.contact)

module.exports = router;