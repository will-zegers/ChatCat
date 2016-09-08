'use strict';

const express  = require('express');
const app      = express();
const chatCat  = require('./app');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', chatCat.router);

app.listen(app.get('port'), () => {
  console.log('ChatCAT running on port: ', app.get('port'));
});