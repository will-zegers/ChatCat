'use strict';

const dotenv   = require('dotenv').load();
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
app.use(require('morgan')('combined', {
  stream: {
    write: message => {
      // Write to logs
      chatCat.logger.log('info', message);
    }
  }
}));

app.use('/', chatCat.router);

chatCat.ioServer(app).listen(app.get('port'), () => {
  console.log('ChatCAT running on port: ', app.get('port'));
});

// chatCat.ioServer(app).listen(process.env.PORT || 3000);
// app.listen(process.env.PORT || 3000);
