/*jslint browser: true, node: true, eqeq: true, newcap: true, plusplus: true, sloppy: true, vars: true*/
/*global $, module, console, require, flickr, escape*/


var blockspring = require("blockspring");
var db = require('../models/database');
var crawlers = require('../models/crawlers');



function getFlickrImages(callback) {
    db.findDbData(function(data) {
        var x = 0,
            arr = [];
        for (x = 0; x < data.length; x = x + 1) {
            arr.push(data[x]);
        }
        crawlers.getFlickr(arr, callback);
    });
}

function getTwitterImages(callback) {
    db.findDbData(function(data) {
        var x = 0,
            arr = [];
        for (x = 0; x < data.length; x = x + 1) {
            arr.push(data[x]);
        }
        crawlers.getTwitter(arr, callback);
    });
}

function getFBImages(callback) {
    db.findDbData(function(data) {
        var x = 0,
            arr = [];
        for (x = 0; x < 10; x = x + 1) {
            arr.push(data[x]);
        }
        crawlers.getFB(arr, callback);
    });
}

function getDBpediaImages(callback) {
    db.findDbData(function(data) {
        var x = 0,
            arr = [];
        for (x = 0; x < data.length; x = x + 1) {
            arr.push(data[x]);
        }
        crawlers.getDbPedia(arr, callback);
    });
}


var ExifImage = require('exif').ExifImage;

function convert(deg, min, sec) {
    var dec_min = (min * Number(1.0) + (sec / 60.0));
    var answer = deg * Number(1.0) + (dec_min / 60.0);
    return answer;
}

function dataFromImg(img, callback) {
    var request = require('request').defaults({
        encoding: null
    });
    request.get(img, function(err, res, body) {
        try {
            new ExifImage({
                image: body
            }, function(error, exifData) {
                if (error) {
                    console.log('Error: ' + error.message);
                } else {

                    var gps = exifData.gps;
                    var lat = convert(gps.GPSLatitude[0], gps.GPSLatitude[1], gps.GPSLatitude[2]);
                    var lng = convert(gps.GPSLongitude[0], gps.GPSLongitude[1], gps.GPSLongitude[2]);
                    var coord = [lat, lng];
                    callback(coord);
                }
            });
        } catch (error) {
            console.log('Error: ' + error.message);
        }
    });
}


function scrapeImages(name, scraper, callback) {
    var toCrawl = 0;
    var allImg = [];


    if (scraper[0]) {
        crawlers.getDbPedia([name], function(res) {
            toCrawl++;
            allImg.push(res);
            if (toCrawl == scraper.reduce(function(p, v) {
                    return (p + v);
                })) {
                callback(allImg);
            }
        });
    }
    if (scraper[1]) {
        crawlers.getFlickr([name], function(res) {
            toCrawl++;
            allImg.push(res);
            console.log("flicker received");
            if (toCrawl == scraper.reduce(function(p, v) {
                    return (p + v);
                })) {
                callback(allImg);
            }
        });
    }
    if (scraper[2]) {
        crawlers.getTwitter([name], function(res) {
            toCrawl++;
            allImg.push(res);
            console.log("twitter received");
            if (toCrawl == scraper.reduce(function(p, v) {
                    return (p + v);
                })) {
                callback(allImg);
            }
        });
    }

    if (scraper[3]) {
        crawlers.getFB([name], function(res) {
            toCrawl++;
            allImg.push(res);
            console.log("fb received");
            if (toCrawl == scraper.reduce(function(p, v) {
                    return (p + v);
                })) {
                callback(allImg);
            }
        });
    }
    //callback(0);
}



function changeImg(mountName) {
    db.findDoc({
        name: mountName
    }, function(doc) {
        var x;
        if (doc && doc.data.imgs) {
            for (x in doc.data.imgs) {
                if (doc.data.imgs.hasOwnProperty(x)) {
                    var y;
                    for (y in doc.data.imgs[x]) {
                        if (doc.data.imgs[x].hasOwnProperty(y)) {
                            dataFromImg(doc.data.imgs[x][y], function(res) {
                                var img = {};
                                img.coord = res;
                                img.src = doc.data.imgs[x][y];
                                img.source = x;
                                db.pushImg(mountName, img, "others", console.log);
                                var data1 = {
                                    name: mountName
                                };
                                var source = "data.imgs." + x;
                                var data2 = {};
                                data2.$pull = {};
                                data2.$pull[source] = doc.data.imgs[x][y];
                                db.updateDoc(data1, data2);

                            });
                        }
                    }
                }

            }
        }
    });
}





var appFunctions = {

    pushArrayImagesIntoDB: function(data, callback) {
        db.pushArrayImagesIntoDB(data, callback);
    },
    validateImage: function(url, name, callback) {
        crawlers.validateImg(url, name, callback);
    },

    scrapeImages: function(name, scraper, callback) {
        scrapeImages(name, scraper, callback);
    },
    insertDoc: function(doc, callback) {
        db.insertDoc(doc, callback);
    },
    changeImg: function(name) {
        changeImg(name);
    },
    dataFromImg: function(data, callback) {
        dataFromImg(data, callback);
    },

    findDoc: function(data, callback) {
        db.findDoc(data, callback);
    },

    findAttr: function(data1, data2, callback) {
        db.findAttr(data1, data2, callback);
    },
    //MOUNTAINS CRAWLERS
    initializeMountains: function() {
        crawlers.getMounts(db.insertDoc);
    },

    initializeMountainsDBpedia: function() {
        crawlers.getMountains(db.insertDoc);
    },

    //IMAGE CRAWLERS
    initializeFlickr: function() {
        getFlickrImages(db.insArrayImagesIntoDB);
    },

    initializeTwitter: function() {
        getTwitterImages(db.insArrayImagesIntoDB);
    },

    initializeFB: function() {
        getFBImages(db.insArrayImagesIntoDB);
    },

    initializeDBpedia: function() {
        getDBpediaImages(db.insArrayImagesIntoDB);
    },

    initializeALL: function() {
        appFunctions.initializeMountains();
        appFunctions.initializeMountainsDBpedia();
        appFunctions.initializeFlickr();
        appFunctions.initializeTwitter();
        appFunctions.initializeFB();
        appFunctions.initializeDBpedia();
    }
};

module.exports = appFunctions;