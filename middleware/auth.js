const event = require('../model/event');
const {validateId} = require('../middleware/validator');
exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    }
    else{
        req.flash('error', 'You are already logged in');
        return res.redirect('/user/profile');  
    }
}

exports.isLoggedIn = (req, res, next)=>{
    console.log(req.session,'logged in');
    if(req.session.user){
        return next();
    }
    else{
        req.flash('error', 'You are not logged in');
        return res.redirect('/user/login');
    }
}

// check if user is author of story
exports.isHost = (req, res, next)=>{
    let id = req.params.id;
    event.findById(id)
    .then(event=>{

        if(event){
            if(event.name == req.session.user){
                return next();
        }
        else{
            let err = new Error('You are not the author of this story');
            err.status = 401;
            return next(err);
            req.flash('error', 'You are not the author of this story');
            
        }

        }
        else{
            let err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
};

exports.isNotHost = (req, res, next)=>{
    let id = req.params.id;
    event.findById(id)
    .then(event=>{

        if(event){
            if(event.Host != req.session.user){
                return next();
        }
        else{
            let err = new Error('You are the Host of this story');
            err.status = 401;
            return next(err);
            req.flash('error', 'You are not the author of this story');
            
        }

        }
        else{
            let err = new Error('Cannot find a story with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
};