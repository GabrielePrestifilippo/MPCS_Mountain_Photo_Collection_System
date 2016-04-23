/*jslint browser: true, node: true, eqeq: true, sloppy: true, vars: true, regexp: true*/
/*global $, console, require, flickr, escape*/


var appFunctions = require('../controller/appFunctions');
var bodyParser = require('body-parser');



module.exports = function(app) {

    app.use(bodyParser.json());

    app.get('/', function(req, res) {
        res.render('index.html', {});
    });

    app.post('/mount', function(req, res) {
        var name = req.body.name;
        console.log("req: " + name);
        name = name.replace(/(.{1})/g, "$1\\s*");
        var r = new RegExp(name, "gi");
        var data = {
            name: r
        };
        console.log(data);
        appFunctions.findDoc(data, function(doc) {
            if (doc !== undefined) {
                res.send(JSON.stringify(doc));
            }
        });

    });

    app.post('/new', function(req, res) {
        var name = req.body.name;
        var lat = req.body.lat;
        var lng = req.body.lng;
        var mount = {};
        mount.name = name;
        mount.data = {};
        mount.data.lat = lat;
        mount.data.lng = lng;
        mount.data.img = [];
        console.log(mount);
        appFunctions.insertDoc(mount, function(dbres) {
            if (dbres !== undefined) {
                res.send(JSON.stringify(dbres));
            }
        });

    });

    app.post('/scraper', function(req, res) {
        var scraper = req.body.scraper;
        var name = req.body.name;
        appFunctions.scrapeImages(name, scraper, function(img) {
            res.send(JSON.stringify(img));
        });

    });

    app.post('/pushimgs', function(req, res) {
        var data = req.body.data;
        var x;
        for (x in data.data) {
            if (data.data.hasOwnProperty(x)) {
                if (data.data[x].length > 0) {
                    var obj = {};
                    obj.name = data.name;
                    obj.service = x;
                    obj.images = data.data[x];

                    var arr = [obj];
                    console.log("Name to change: ", data.name);
                    appFunctions.pushArrayImagesIntoDB(arr, appFunctions.changeImg);

                }
            }
        }
        res.send(1);

    });


    app.post('/validate', function(req, res) {
        var url = req.body.url;
        var name = req.body.name;
        appFunctions.validateImage(url, name, function(val) {
            res.send(val);
        });

    });

    app.get('/listMounts', function(req, res) {
        var data1 = {};
        var data2 = {
            'name': 1,
            '_id': 0
        };
        appFunctions.findAttr(data1, data2, function(doc) {
            if (doc !== undefined) {
                res.send(JSON.stringify(doc));
            }
        });
    });

};