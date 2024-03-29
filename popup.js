// Copyright (c) 2012,2013 Peter Coles - http://mrcoles.com/ - All rights reserved.
// Use of this source code is governed by the MIT License found in LICENSE
$(document).ready(function() {

    
    var background = chrome.extension.getBackgroundPage();
    checkauth();    // Whenever click popup button, load it first to check cookies
    function checkauth() {
        background.checkauth(showinfo);
    }
    $('#login').on('click', login);
    $('#logout').on('click', logout);
    function login() {
        background.server = $('#SERVER').val();
        var account = $('#ACCOUNT').val();
        var password = $('#PASSWORD').val();
        background.login(account, password, showinfo);
    }
    function logout() {
        background.logout(checkauth);
        $('#ACCOUNT').val('');
        $('#PASSWORD').val('');
        $('#test').text('');
        $('#SERVER').val('');
    }
    /*
    function upload() {
        var imagename = $('#imagename').val();
        background.upload(imagename, function(data) {
            $("#test2").text(data);
            setTimeout(function() {
                $("#test2").text('');
                $("#imagename").val('');
            }, 5000);
        });
    }*/

    //show the information or hide
    function showinfo(data) {
        if (data == 1) {
            //$('#test').text("already login");
            $('#logout,#imagename,#upload,#test2,#wrap').show();
            $('#login,#ACCOUNT,#PASSWORD,#test,label,#SERVER').hide();

        } else if (data == 0) {
            //$('#test').text("Error");
            $('#logout,#imagename,#upload,#test2,#wrap').hide();
            $('#login,#ACCOUNT,#PASSWORD,#test,label,#SERVER').show();
        } else if (data == 2) {
            $('#test').text("Error, please enter the correct host address.");
            $('#logout,#imagename,#upload,#test2,#wrap').hide();
            $('#login,#ACCOUNT,#PASSWORD,#test,label,#SERVER').show();
        }else {
            $('#test').text(data);
            //$('#test').text("you have to login");
            $('#logout,#imagename,#upload,#test2,#wrap').hide();
            $('#login,#ACCOUNT,#PASSWORD,#test,label,#SERVER').show();
        }

    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Screen capture below..

var log = (function() {
    var parElt = document.getElementById('wrap'),
        logElt = document.createElement('div');
    logElt.id = 'log';
    logElt.style.display = 'block';
    parElt.appendChild(logElt);

    return function() {
        var a, p, results = [];
        for (var i=0, len=arguments.length; i<len; i++) {
            a = arguments[i];
            try {
                a = JSON.stringify(a, null, 2);
            } catch(e) {}
            results.push(a);
        }
        p = document.createElement('p');
        p.innerText = results.join(' ');
        p.innerHTML = p.innerHTML.replace(/ /g, '&nbsp;');
        logElt.appendChild(p);
    };
})();

//
// utility methods
function xx(id) { return document.getElementById(id); }
function show(id) { xx(id).style.display = 'block'; }
function hide(id) { xx(id).style.display = 'none'; }

//
// URL Matching test - to verify we can talk to this URL
//
var matches = ['http://*/*', 'https://*/*', 'ftp://*/*', 'file://*/*'],
    noMatches = [/^https?:\/\/chrome.google.com\/.*$/];
function testURLMatches(url) {
    // couldn't find a better way to tell if executeScript
    // wouldn't work -- so just testing against known urls
    // for now...
    var r, i;
    for (i=noMatches.length-1; i>=0; i--) {
        if (noMatches[i].test(url)) {
            return false;
        }
    }
    for (i=matches.length-1; i>=0; i--) {
        r = new RegExp('^' + matches[i].replace(/\*/g, '.*') + '$');
        if (r.test(url)) {
            return true;
        }
    }
    return false;
}

//
// Events
//
var screenshot, contentURL = '';

function sendScrollMessage(tab) {
    contentURL = tab.url;
    screenshot = {};
    chrome.tabs.sendRequest(tab.id, {msg: 'scrollPage'}, function() {
        // We're done taking snapshots of all parts of the window. Display
        // the resulting full screenshot image in a new browser tab.
        openPage();
    });
}

function sendLogMessage(data) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {msg: 'logMessage', data: data}, function() {});
    });
}

chrome.extension.onRequest.addListener(function(request, sender, callback) {
    if (request.msg === 'capturePage') {
        capturePage(request, sender, callback);
    } else {
        console.error('Unknown message received from content script: ' + request.msg);
    }
});

function capturePage(data, sender, callback) {
    var canvas;

    //xx('bar').style.width = parseInt(data.complete * 100, 10) + '%';

    // Get window.devicePixelRatio from the page, not the popup
    var scale = data.devicePixelRatio && data.devicePixelRatio !== 1 ?
        1 / data.devicePixelRatio : 1;

    // if the canvas is scaled, then x- and y-positions have to make
    // up for it
    if (scale !== 1) {
        data.x = data.x / scale;
        data.y = data.y / scale;
        data.totalWidth = data.totalWidth / scale;
        data.totalHeight = data.totalHeight / scale;
    }


    if (!screenshot.canvas) {
        canvas = document.createElement('canvas');
        canvas.width = data.totalWidth;
        canvas.height = data.totalHeight;
        screenshot.canvas = canvas;
        screenshot.ctx = canvas.getContext('2d');

        // sendLogMessage('TOTALDIMENSIONS: ' + data.totalWidth + ', ' + data.totalHeight);

        // // Scale to account for device pixel ratios greater than one. (On a
        // // MacBook Pro with Retina display, window.devicePixelRatio = 2.)
        // if (scale !== 1) {
        //     // TODO - create option to not scale? It's not clear if it's
        //     // better to scale down the image or to just draw it twice
        //     // as large.
        //     screenshot.ctx.scale(scale, scale);
        // }
    }

    // sendLogMessage(data);

    chrome.tabs.captureVisibleTab(
        null, {format: 'png', quality: 100}, function(dataURI) {
            if (dataURI) {
                var image = new Image();
                image.onload = function() {
                    // sendLogMessage('img dims: ' + image.width + ', ' + image.height);
                    screenshot.ctx.drawImage(image, data.x, data.y);
                    callback(true);
                };
                image.src = dataURI;
            }
        });
}

function openPage() {
    // standard dataURI can be too big, let's blob instead
    // http://code.google.com/p/chromium/issues/detail?id=69227#c27

    var dataURI = screenshot.canvas.toDataURL();
    //var newdataURI = dataURI.replace(/^data:image\/(png|jpg);base64,/, "");
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // create a blob for writing to a file
    var blob = new Blob([ab], {type: mimeString});

    // come up with file-system size with a little buffer
    var size = blob.size + (1024/2);

    // come up with a filename
    var name = contentURL.split('?')[0].split('#')[0];
    if (name) {
        name = name
            .replace(/^https?:\/\//, '')
            .replace(/[^A-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^[_\-]+/, '')
            .replace(/[_\-]+$/, '');
        name = '-' + name;
    } else {
        name = '';
    }
    name = 'screencapture' + name + '-' + Date.now() + '.png';


    function onwriteend(imagename) {
        // open the file that now contains the blob
        //var path = 'filesystem:chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/temporary/' + name ;
        //var $im = $("<img>", {src: path});
        //$("#d").append($im);
        //window.open(path);
        //var background = chrome.extension.getBackgroundPage();
        background.upload(imagename, blob, function(data) {
            $("#test2").text(data);
            setTimeout(function() {
                $("#test2").text('');
                $("#imagename").val('');
            }, 5000);
        });
    };


        var imagename = $('#imagename').val();
        if (imagename == "") imagename = "default";
        onwriteend(imagename);


    function errorHandler() {
        show('uh-oh');
    }
    /*
    // create a blob for writing to a file
    window.webkitRequestFileSystem(window.TEMPORARY, size, function(fs){
        fs.root.getFile(name, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = onwriteend;
                sfileWriter.write(blob);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
*/
    /*
    var download = document.createElement('a');
        download.href = 'filesystem:chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/temporary/';
        download.download = name;
        download.click();

        var background = chrome.extension.getBackgroundPage();
    
        background.upload(download, function(data) {
            $("#test2").text(data);
            setTimeout(function() {
                $("#test2").text('');
                $("#imagename").val('');
            }, 5000);
    });*/
    
}

//
// start doing stuff immediately! - including error cases
//

function snap(){
chrome.tabs.getSelected(null, function(tab) {

    if (testURLMatches(tab.url)) {
        var loaded = false;

        chrome.tabs.executeScript(tab.id, {file: 'page.js'}, function() {
            loaded = true;
            show('loading');
            sendScrollMessage(tab);
        });

        window.setTimeout(function() {
            if (!loaded) {
                show('uh-oh');
            }
        }, 1000);
    } else {
        show('invalid');
    }
});
}
$('#upload').on('click', snap);








})
