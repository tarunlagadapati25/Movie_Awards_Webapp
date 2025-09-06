const express = require('express');
const ejs= require('ejs');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const mainRoutes = require('./routes/mainRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const model = require('./model/user')

//create app
const app = express();

//config app
let port = 3000;
let host = 'localhost';
let url = 'mongodb+srv://demo:demo123@project3.nfke8nc.mongodb.net/nbad-project3?retryWrites=true&w=majority&appName=Project3';
app.set('view engine', 'ejs');

//connect to database
mongoose.connect (url)
.then(()=>{
    app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
    });
})
.catch((err)=>{
    console.log(err.message);
})

//mount middleware
app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


//create session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000
    },
    store: new MongoStore({ mongoUrl: 'mongodb://0.0.0.0:27017/sample' })
}));

app.use(flash());
//create middleware
app.use((req, res, next) => {

   // console.log(req.session,'checking session');
    res.locals.user = req.session.user||null;
    if(res.locals.user)
    {
        model.findById(res.locals.user)
        .then(user=>{   
            res.locals.username = req.session.username;
            console.log(res.locals.username);
            next();
        })
        .catch(err=>next(err));
        res.locals.errorMessages = req.flash('error');
        res.locals.successMessages = req.flash('success');
    }
    else{
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
    }
})


app.use('/events', eventRoutes);
app.use('/', mainRoutes);
app.get('/', (req, res) => {
    res.render('index');
});
app.use('/user', userRoutes);

app.use((req, res, next) => {
    let err=new Error('the server cannot locate '+ req.url);
    err.status = 404;

    next(err);
    });

app.use((err, req, res, next) => {
    if(!err.status){
        console.log(err);
        err.status = 500;
        err.message = 'Something went wrong';
    }

    res.status(err.status);
    console.log(err);
    res.render('error', {error: err}); 
})
