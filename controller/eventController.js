const model = require('../model/event')
const rsvpModel = require('../model/rsvp');
const {DateTime} = require('luxon') 

exports.index=(req,res,next)=>{
    model.find()
    .then((events)=>{
        res.render('./events/index',{events})
    })
    .catch(err=>next(err))
}

exports.new=(req,res,next)=>{
    res.render('./events/bookahall')
}

exports.create = (req,res,next)=>{
    let event = new model(req.body);
    event.name=req.session.user;
    console.log(event)
    let image="/images/"+req.file.filename;
    event.images=image;
    event.save()
    .then(()=>{
        res.redirect('./events');
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err)
    });
    
}

exports.show = (req, res, next)=>{

    let id = req.params.id;
    let user = req.session.user;
    console.log(user);
    Promise.all([
        model.findById(id).populate('name', 'firstName lastName'),
        rsvpModel.find({ event: id, rsvp:'yes' }),
      ])
    .then((results)=>{
        const [event, rsvps] = results;
        console.log(rsvps);
        if(event){
            //console.log(connection.id);
            let isHost = req.session.user == event.name._id;
            return res.render('./events/show',{event, isHost, rsvps});
        }
        else{
            let err = new Error('Cannot find the event with id '+ id);
            err.status=404;
            next(err);
        }
    })

    .catch(err=>next(err)); 
};

exports.edit=(req,res,next)=>{
    let id=req.params.id

    if(!id.match(/^[0-9a-zA-Z]{24}$/)){
        let err = new Error('Invalid Story id');
        err.status = 400;
        next(err)

    }
    model.findById(id).lean()
    .then((event)=>{
        if(event){
            let start_time = DateTime.fromJSDate(event.starttime);
            event.starttime=start_time.toFormat('yyyy-MM-dd\'T\'HH:mm');
            let end_time = DateTime.fromJSDate(event.endtime);
            event.endtime=end_time.toFormat('yyyy-MM-dd\'T\'HH:mm');
            res.render('./events/edit',{event})
           }
           else{
            let err = new Error("Cannot find event with id:"+ id)
            err.status = 404
            next(err)
           }
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err)
    });
}

exports.update=(req,res,next)=>{
    let id=req.params.id
    let info=req.body

    if(!id.match(/^[0-9a-zA-Z]{24}$/)){
        let err = new Error('Invalid Story id');
        err.status = 400;
        next(err)

    }
    model.findByIdAndUpdate(id,info,{runValidators:true})
    .then((details)=>{
        if(details){
            req.flash('success', 'You have updated this event');
            res.redirect('/events/'+id)
        }
        else{
            let err = new Error("Cannot find event with id:"+ id)
        err.status = 404
        next(err)
        }
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err)
    });
  
}

exports.delete=(req,res,next)=>{
    let id=req.params.id
    if(!id.match(/^[0-9a-zA-Z]{24}$/)){
        let err = new Error('Invalid Story id');
        err.status = 400;
        next(err)

    }
    Promise.all([
        model.findByIdAndDelete(id),
        rsvpModel.deleteMany({event: id})
      ])
    .then(results=>{
        const[event,rsvp]=results;
        if(event && rsvp)
        {
            req.flash('success', 'Event has been deleted successfully');
            res.redirect('/events');
        }
        else
        {
            let err= new Error('Cannot find the connection with id '+id);
            err.status=404;
            next(err);
        }
    })
    .catch(err=>next(err))
}

exports.editRsvp = (req, res, next)=>{
    console.log(req.body.rsvp);
    let id = req.params.id;
    rsvpModel.findOne({event:id})
    .then(rsvp=>{
        if(rsvp){
            //update
            rsvpModel.findByIdAndUpdate(rsvp._id, {rsvp:req.body.rsvp}, {useFindAndModify: false, runValidators: true})
            .then(rsvp=>{
                req.flash('success','Successfully updated RSVP');
                res.redirect('/user/profile');
            })
            .catch(err=>{
                console.log(err);
                if(err.name=== 'validationError'){
                    req.flash('error', err.message);
                    return res.redirect('/back');
                }
                next(err);
            });
        }
        else{
            //create
            let rsvp = new rsvpModel({
                event: id,
                rsvp: req.body.rsvp,
                user: req.session.user
            });
            rsvp.save()
            .then(rsvp=>{
                req.flash('success', 'successfully created Rsvp');
                res.redirect('/user/profile');
            })
            .catch(err=>{
                req.flash('error',err.message)
                next(err)
            });
        }
    })

}