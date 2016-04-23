/*jslint devel: true, plusplus: true, sloppy: true, vars: true*/
/*global $, module, console, require, flickr, escape*/

//MONGO SETUP
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/mountain';


MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.close();
});


var cursor;


function findDbData(callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var data = [];
        db.collection('mountain').find().toArray(function(err, docs) {
            docs.forEach(function(doc) {
                data.push(doc.name);
            });
            db.close();
            callback(data);
        });
    });
}

function findDoc(data, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var doc = {};
        db.collection('mountain').find(data).toArray(function(err, docs) {
            docs.forEach(function(elem) {
                doc = elem;
            });
            db.close();
            if (doc) {
                callback(doc);
            }
        });

    });
}

function findAttr(data1, data2, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var doc = [];
        db.collection('mountain').find(data1, data2).toArray(function(err, docs) {
            docs.forEach(function(elem) {
                doc.push(elem.name);
            });
            db.close();
            callback(doc);
        });

    });
}


function insertDoc(data, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('mountain').insert(data, function(err, result) {
            console.log("Inserted a document");
            db.close();
            callback(0);
        });
    });
}

function updateDoc(data1, data2) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        if (!data2) {
            db.collection('mountain').update(data1, function(err, result) {
                console.log("Inserted a document");
                db.close();
            });
        } else {
            db.collection('mountain').update(data1, data2, function(err, result) {
                console.log("Inserted a document");
                db.close();
            });
        }
    });
}


function errRes(err, result) {
    if (err) {
        console.log(err);
    }
}



function insArrayImagesIntoDB(data) {
    MongoClient.connect(url, function(err, db) {
        var x;
        if (db && data) {
            for (x = 0; x < data.length; x++) {
                var val = {};
                switch (data[x].service) {
                    case "twitter":
                        val = {
                            "data.imgs.twitter": data[x].images
                        };
                        break;
                    case "flickr":
                        val = {
                            "data.imgs.flickr": data[x].images
                        };
                        break;
                    case "fb":
                        val = {
                            "data.imgs.fb": data[x].images
                        };
                        break;
                    case "dbPedia":
                        val = {
                            "data.imgs.dbpedia": data[x].images
                        };
                        break;
                }
                db.collection('mountain').update({
                    name: data[x].name
                }, {
                    $set: val
                }, errRes());
            }
            console.log("inserted");
            db.close();
        }
    });
}

function pushArrayImagesIntoDB(data, callback) {
    MongoClient.connect(url, function(err, db) {
        var x;
        if (db && data) {
            for (x = 0; x < data.length; x++) {
                var val = {};
                switch (data[x].service) {
                    case "twitter":
                        val = {
                            "data.imgs.twitter": {
                                $each: data[x].images
                            }
                        };
                        break;
                    case "flickr":
                        val = {
                            "data.imgs.flickr": {
                                $each: data[x].images
                            }
                        };
                        break;
                    case "fb":
                        val = {
                            "data.imgs.fb": {
                                $each: data[x].images
                            }
                        };
                        break;
                    case "dbPedia":
                        val = {
                            "data.imgs.dbpedia": {
                                $each: data[x].images
                            }
                        };
                        break;
                }

                db.collection('mountain').update({
                    name: data[x].name
                }, {
                    $push: val
                }, errRes());

            }
            callback(data[0].name);
            db.close();
        }
    });
}

function pushImg(data) {
    console.log(data);
    MongoClient.connect(url, function(err, db) {
        var x;
        if (db && data) {
            var val = {};
            switch (data.service) {
                case "twitter":
                    val = {
                        "data.imgs.twitter": data.image
                    };
                    break;
                case "flickr":
                    val = {
                        "data.imgs.flickr": data.image
                    };
                    break;
                case "fb":
                    val = {
                        "data.imgs.fb": data.image
                    };
                    break;
                case "dbPedia":
                    val = {
                        "data.imgs.dbpedia": data.image
                    };
                    break;
                case "others":
                    val = {
                        "data.imgs.others": data.image
                    };
                    break;
            }
            db.collection('mountain').update({
                name: data.name
            }, {
                $push: val
            }, function(err, result) {});
        }
        db.close();
    });
}


var database = {

    findDbData: function(callback) {
        findDbData(callback);
    },

    findDoc: function(data, callback) {
        findDoc(data, callback);
    },

    findAttr: function(data1, data2, callback) {
        findAttr(data1, data2, callback);
    },

    pushImg: function(nameMount, img, service, callback) {
        var obj = {};
        obj.name = nameMount;
        obj.service = service;
        obj.image = img;
        pushImg(obj);
        callback("ok");
    },

    insertDoc: function(doc, callback) {
        insertDoc(doc, callback);
    },

    updateDoc: function(data1, data2) {
        updateDoc(data1, data2);
    },


    pushArrayImagesIntoDB: function(array, callback) {
        pushArrayImagesIntoDB(array, callback);
    },

    insArrayImagesIntoDB: function(array) {
        insArrayImagesIntoDB(array);
    }



};



module.exports = database;