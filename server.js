/*jslint devel: true, nomen: true*/
/*global console, require, __dirname*/

var express = require('express');
var app = express();


require('./controller/main')(app);
require('./controller/appFunctions');
require('./models/database');
require('./models/crawlers');


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express['static'](__dirname +  '/public'));
app.use(express['static'](__dirname + '/bower_components'));

var server = app.listen(8080, function () {
    "use strict";
    console.log("Express is running on port 8080");
});
