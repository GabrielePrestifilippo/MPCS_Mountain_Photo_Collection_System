/*jslint devel: true, eqeq: true, plusplus: true, sloppy: true, vars: true*/
/*global $, $$, Chosen, jQuery, console, require, flickr, escape, insertMount, notEmpty*/

var menu = 0;

$("#option").click(function () {
    if (menu === 0) {
        $("#menu").css("left", "0px");
        $("#map").css("-webkit-filter", "blur(5px)");
        menu = 1;
    } else {
        $("#menu").css("left", "-466px");
        $("#map").css("-webkit-filter", "blur(0px)");
        menu = 0;
    }
});

var tmp;


function geoSuccess(coords) {
    $("#geolat").val(coords[0]);
    $("#geolng").val(coords[1]);
}

function failMessage(message) {
    $(".error").text(message);
    $(".error").css("opacity", 1);
    setTimeout(function () {
        $(".error").css("opacity", 0);
    }, 2000);
}

function positiveMessage(message) {
    $(".success").text(message);
    $(".success").css("opacity", 1);
    setTimeout(function () {
        $(".success").css("opacity", 0);
    }, 3000);
}

function geoCoding(name) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + name + "&key=YOUR_KEY",
        type: "GET",
        success: function (res) {
            var coords = [];
            var lat, lng;
            try {
                lat = res.results[0].geometry.location.lat;
                lng = res.results[0].geometry.location.lng;
                coords.push(lat);
                coords.push(lng);
                positiveMessage("Coordinates found");
                geoSuccess(coords);
            } catch (e) {
                failMessage("Coordinates not found");
            }
        }
    });
}



function validateImage(url, name) {
    
    $.ajax({
        url: "http://5.249.147.66:8080/validate",
        type: "POST",
        data: JSON.stringify({name: name, url: url}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        complete: function (res) {
            console.log(res.responseText);
        }
    });
}


function searchMount(query) {
    $.ajax({
        url: "http://5.249.147.66:8080/mount",
        type: "POST",
        data: JSON.stringify({name: query}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (s) {
            insertMount(s);
            $("#option").click();
            tmp = s;
        }
    });
}

function listMounts(list) {
    list = JSON.parse(list);
    var x;
    var string = "";
    for (x = 0; x < list.length; x++) {
        string = string + '<option value="' + list[x] + '">' + list[x] + '</option>';
    }
    var elements = $(".chosen-select");
    $(".chosen-select").html(string);
    $("#allMountains").show();
    elements.chosen({no_results_text: 'No mountains found!'});
    $(".chosen-select").trigger("chosen:updated");

}


function allMounts() {
    $.ajax({
        url: "http://5.249.147.66:8080/listMounts",
        type: "GET",
        success: function (s) {
            listMounts(s);
        }
    });
}



function saveMount() {
    
    var name = $("#geoname").val();
    var lat = $("#geolat").val();
    var lng = $("#geolng").val();
    
    if (!name || !lat || !lng) {
        failMessage("All inputs should be provided");
        return;
    }
    
    $.ajax({
        url: "http://5.249.147.66:8080/new",
        type: "POST",
        data: JSON.stringify({name: name, lat: lat, lng: lng}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (s) {
            positiveMessage("Mount Inserted in Database!");
            allMounts();
        }
    });
}

function showImages(allImg, name) {
    var x;
    if (!notEmpty(allImg)) {
        failMessage("No images found");
        return;
    }
    var valImage = 0;
    var string = '<select class="image-picker show-labels show-html" multiple="multiple" >';
    for (x in allImg) {
        if (allImg[x].length > 0) {
            var y;
            for (y in allImg[x][0].images) {
                valImage++;
                string = string + '<option value="' + valImage + '" data-img-label="' + allImg[x][0].service + '" data-img-src="' + allImg[x][0].images[y] + '">' + allImg[x][0].service + '</option>';
            }
        }
    }
    string = string + '</select>';
    $("#contElem4").html(string);
    var button = "<button class='btn' onClick='verifyImages(&quot;" + name + "&quot;)' >Verify selected</button>";
    button = button + "<button class='btn' onClick='pushImages(&quot;" + name + "&quot;)' >Insert Pics</button>";
    $("#contElem4").append(button);
    $("#contElem4 select").imagepicker();
}


function pushImages(name) {
    var imgs = $('.image-picker').find(":selected");
    var obj = {data: {dbPedia: [], flickr: [], twitter: [], fb: []}, name: name};
    var x;
    for (x = 0; x < imgs.length; x++) {
        obj.data[$(imgs[x]).text()].push($(imgs[x]).attr("data-img-src"));
    }

    $.ajax({
        url: "http://5.249.147.66:8080/pushimgs",
        type: "POST",
        data: JSON.stringify({data: obj}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        complete: function (res) {
            positiveMessage("Image inserted correctly");
            $("#contElem4").html("");
        }
    });
   
}

function verifyImages(name) {
    var imgs = $('.image-picker').find(":selected");
    
    if (imgs.length > 1) {
        failMessage("Verify one image per time");
        return;
    }
    if (imgs.length === 0) {
        failMessage("Select at least one image!");
        return;
    }
 
 
    var pic = $(imgs[0]).attr("data-img-src");
        
    positiveMessage("Wait for verification...");
    $.ajax({
        url: "http://5.249.147.66:8080/validate",
        type: "POST",
        data: JSON.stringify({url: pic, name: name}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        complete: function (res) {
            positiveMessage(JSON.stringify(res.responseText));
        }
    });
   
}


function scrapeStart() {
    var arr = [];
    var db = Number($("#dbopt").is(":checked"));
    var fl = Number($("#flopt").is(":checked"));
    var tw = Number($("#twopt").is(":checked"));
    var fb = Number($("#fbopt").is(":checked"));
    arr.push(db, fl, tw, fb);
    var name = $("#chosen2").val();
    
    if (!arr.reduce(function (p, v) {return (p + v); })) {
        failMessage("Select at least one option");
        return;
    }
    $.ajax({
        url: "http://5.249.147.66:8080/scraper",
        type: "POST",
        data: JSON.stringify({name: name, scraper: arr}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (s) {
            showImages(s, name);
            
           
            
        }
    });
    
    positiveMessage("Crawler is scraping, images will be available soon");

}



$("#searchbyName").click(function () {
    var query = $(".chosen-select").val();
    if (query.length > 2) {
        searchMount(query);
    }
});

$("#map").click(function () {
    if (menu == 1) {
        $("#option").click();
    }
});

$("#newMount").click(function () {
    $("#contElem2").css("left", "0px");
    $("#contElem2").css("height", "initial");
});

$("#scrapeImage").click(function () {
    $("#contElem3").css("left", "0px");
});


$("#insMount").click(function () {
    saveMount();
});

$("#scrapeStart").click(function () {
    scrapeStart();
});


$("#geocode").click(function () {
    var name = $("#geoname").val();
    name = name.replace(/\s/g, '');
    geoCoding(name);
});



$(document).ready(function () {
    allMounts();
});

