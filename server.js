var express = require('express');
var app = express();
var port = 8080;
var config = require('./config/database');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
var passport = require('passport');
var apiroute = require('./routes/api');
var indexroute = require('./routes/index');
var userroute = require('./routes/users');
var adminroute = require('./routes/admins');


mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
app.set('view engine', '.hbs');
app.set('views', './views');
app.engine('hbs', expressHbs.engine({
    extname: 'hbs',
    defaultLayout: 'layouts',
    layoutDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowedProtoMethodsByDefault: true
    }
}));




app.use('/', indexroute);
app.use('/admin', adminroute);
app.use('/api', apiroute);
app.use('/user', userroute);
app.use(passport.initialize());

module.exports = app;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});