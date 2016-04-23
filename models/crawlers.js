/*jslint browser: true, node: true, eqeq: true, plusplus: true, sloppy: true, vars: true*/
/*global $, module, console, require, flickr, escape*/
/*jshint -W083 */

//FLICKR SETUP
var Flickr = require("node-flickr");
var keys = {
    "api_key": "YOUR_KEY"
};
var flickr = new Flickr(keys);

//TWITTER SETUP
var Twitter = require('twitter');
var client = new Twitter({
    consumer_key: 'YOUR_KEY',
    consumer_secret: 'YOUR_KEY',
    access_token_key: 'YOUR_KEY',
    access_token_secret: 'YOUR_KEY'
});


//DBPEDIA SETUP
var SparqlClient = require('sparql-client');
var endpoint = 'http://dbpedia.org/sparql';

//For reading file
var fs = require('fs');
var csv = require("fast-csv");
var stream = fs.createReadStream("public/alps.csv");


var blockspring = require("blockspring");

var badWords = ["porn", "sex", "drug"];

function wordInString(s, word) {
    return new RegExp(word, 'i', 'g').test(s);
}

function validateImg(input, name, callback) {
    if (!input || !name) {
        return;
    }
    blockspring.runParsed("reverse-image-search", {
        "image_url": input
    }, function (result) {
        console.log("best search:");
        console.log(result.params.best_search);
        console.log(result.params);
        var x;
        try {
            for (x in result.params.best_search) {
                if (result.params.hasOwnProperty(x)) {
                    if (wordInString(badWords, result.params.best_search[x])) {
                        callback("Image not appropriate!");
                        return;
                    }
                }
            }
            if (wordInString(result.params.best_search, name)) {
                callback("Verified successfully!");
                return;
            } else {
                callback("Not possible to determine content");
                return;
            }
        } catch (e) {
            callback("Not possible to determine content");
            return;
        }
    });
}

var crawlers = {
    
    validateImg: function (input, name, callback) {
        validateImg(input, name, callback);
    },
             
    getMounts: function (callback) {
        var doc = [];
        var csvStream = csv()
                .on("data", function (data) {

                    var mount = {};
                    var lat = data[5];
                    var lng = data[6];
                    var name = data[4];

                    mount.name = name;
                    mount.data = {};
                    mount.data.lat = lat;
                    mount.data.lng = lng;
                    mount.data.img = [];
                    doc.push(mount);
                })
                .on("end", function () {
                    callback(doc);
                });

        stream.pipe(csvStream);
    },
  
    
    getTwitter: function (input, callback) {
        var y;
        var arr = [];
        var cycle = 0;
        for (y = 0; y < input.length; y = y + 1) {
            client.get('search/tweets', {
                q: input[y],
                count: 50
            }, function (error, tweets, response) {
                console.log(JSON.stringify(error));
                console.log("res: " + cycle + input[cycle]);
                var obj = {};
                var name = input[cycle];
                obj.name = name;
                obj.service = "twitter";
                var images = [];
                var x;
                cycle = cycle + 1;
                var twi = tweets;
                var i;
                for (i in twi.statuses) {
                    if (twi.statuses.hasOwnProperty(i)) {
                        if (twi.statuses[i].entities.media != null) {
                            var newImage = twi.statuses[i].entities.media[0].media_url;
                            if (images.indexOf(newImage) === -1) {
                                images.push(newImage);
                            }
                        }
                    }
                }
                obj.images = images;
                if (obj.images.length > 0) {
                    arr.push(obj);
                }
                if (cycle == input.length) {
                    callback(arr);
                }
            });
        }
    },

    getFlickr: function (input, callback) {
        var y, arr = [], cycle=0;
        for (y = 0; y < input.length; y = y + 1) {
            flickr.get("photos.search", {
                "tags": input[y]
            }, function (result) {
                var obj = {};
                var name = input[cycle];
                obj.name = name;
                obj.service = "flickr";
                var images = [];
                var x;
                cycle = cycle + 1;
                if (result && result.photos) {
                    for (x in result.photos.photo) {
                        if (result.photos.photo.hasOwnProperty(x)) {
                            var farm = String(result.photos.photo[x].farm);
                            var server = String(result.photos.photo[x].server);
                            var secret = String(result.photos.photo[x].secret);
                            var id = String(result.photos.photo[x].id);
                            images.push("https://farm" + farm + ".staticflickr.com/" + server + "/" + id + "_" + secret + ".jpg");
                        }
                    }
                }
                obj.images = images;
                if (obj.images.length > 0) {
                    arr.push(obj);
                }
                if (cycle == input.length) {
                    callback(arr);
                }
            });
        }
    },
    
    getDbPedia: function (input, callback) {
        var client = new SparqlClient(endpoint);
        var y;
        
       
        for (y = 0; y < input.length; y = y + 1) {
            var cycle = 0;
            var arr = [];
            var query = 'SELECT DISTINCT ?thumbnail WHERE { ?name rdf:type <http://dbpedia.org/ontology/Mountain>; dbpedia-owl:abstract ?description ; dbpedia-owl:thumbnail ?thumbnail . FILTER(regex(?description,"' + input[y] + '","i")). } LIMIT 10';
            client.query(query).execute(function (error, results) {

                
                if (results && results.results.bindings && results.results.bindings[0]) {
                    var obj = {};
                    var name = input[cycle];
                    obj.name = name;
                    obj.service = "dbPedia";
                    var images = [];
                    var x;
                    for (x = 0; x < results.results.bindings.length; x++) {
                        images.push(results.results.bindings[x].thumbnail.value);
                    }
                    obj.images = images;
                    if (obj.images.length > 0) {
                        arr.push(obj);
                    }
                }
                cycle = cycle + 1;
                if (cycle == input.length) {
                    console.log(arr);
                    callback(arr);
                }

            });

        }
    },
        
    getFB: function (input, callback) { //not working very good need to improve the algorithm
        var y;
        var arr = [];
      
        for (y = 0; y < input.length; y = y + 1) {
            var cycle = 0;
            console.log(input[y]);
            blockspring.runParsed("430c77202c424680d0c6809f3b9896ce", { "search_text": input[y], "access_token": "733690130056744|ccebee4bf9e5ca7fe0002b64ac69d8e6" }, { api_key: "br_3124_4a1a43d847c6eb576a4437dcbf34ec40fd42cc19"}, function (res) {
               
                if (res) {
                    var obj = {};
                    var name = input[cycle];
                    obj.name = name;
                    obj.service = "fb";
                    var images = [], x;
                    if (res.params && res.params.Images) {
                        for (x in res.params.Images) {
                            if (res.params.Images.hasOwnProperty(x)) {
                                images.push(res.params.Images[x]);
                            }
                        }
                        obj.images = images;
                        if (obj.images.length > 0) {
                            arr.push(obj);
                        }
                    }
                }
                cycle = cycle + 1;
                if (cycle == input.length) {
                    callback(arr);
                }
                    
            });
       
        }
    },





    getMountains: function (callback) {
        var query = 'SELECT * WHERE {  ?mountain a <http://dbpedia.org/ontology/Mountain> .  ?mountain <http://dbpedia.org/property/name> ?name .  ?mountain <http://dbpedia.org/property/latD> ?latD .  ?mountain <http://dbpedia.org/property/longD> ?longD .} LIMIT 500';
        var client = new SparqlClient(endpoint);
        client.query(query).execute(function (error, results) {
            var x;
            var doc = [];
            var allName = [];
            for (x in results.results.bindings) {
                if (results.results.bindings.hasOwnProperty(x)) {
                    var mount = {};
                    var name = results.results.bindings[x].name.value;
                    var lat =  results.results.bindings[x].latD.value;
                    var lng =  results.results.bindings[x].longD.value;
                    mount.name = name;
                    mount.data = {};
                    mount.data.lat = lat;
                    mount.data.lng = lng;
                    mount.data.img = [];
                    if (allName.indexOf(mount.name) === -1) { //avoid dbpedia duplicates
                        doc.push(mount);
                        allName.push(mount.name);
                    }
                }
            }
            callback(doc);
        });
    }

};


module.exports = crawlers;