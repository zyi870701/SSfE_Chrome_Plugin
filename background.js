var server="";

function checkauth(callback) {
    //delete all localhost cookies
    chrome.cookies.getAll({
        domain: server
    }, function(cookies) {
        //console.log(cookies);
        //console.log("cookie array length: "+cookies.length);
        if (cookies.length == 2) callback(1)	//check cookie array whether it is 2 objects, if yes return 1, else 0
        else callback(0)
    });

}

function login(account, password, callback) {
    $.ajax({
        url: "https://"+server+"/api/v2/usersession",
        type: "POST",
        data: {
            "service": "NzI1ZDM3YWM1NGNjODVjODk1Nzc4N2ZjY2EyYjlhMGYwZTNmMjJmOGNlMmU5YTQzMjNmNWZkZmYxNjI0ODI3NAAxLjAAamNAc3NmZS5pbgAxNDA0NDY2OTIxADEARjNC",
            "realm": "osdp",
            "loginName": account,
            "password": password
        },
        dataType: "html",
        success: function(data) {
            var res = JSON.parse(data);
            if (res['Status'] != "Error") {
                callback(1);
                //console.log(res);
            } else {
                //console.log(res);
                callback(res['Code']); //return error message 
            }
        },
        error: function(data){
                    callback(2)
                }

    })
}

function logout(callback) {
    //delete all localhost cookies'
    chrome.cookies.getAll({
        domain: server
    }, function(cookies) {
        for (var i = 0; i < cookies.length; i++) {
            chrome.cookies.remove({
                url: "https://"+ server + cookies[i].path,
                name: cookies[i].name
            });
        }
        callback() // delete successfully and excute the callback function you want

    });
}


function upload(imagename, something, callback) {
    $.ajax({
        url: "https://"+server+"/api/v2/home",
        type: "GET",	// you will get url like "https://10.1.193.204/api/v2/Hzw" personal root folder 
        dataType: "html",
        success: function(data) {
            var res = JSON.parse(data);
            var obfid = res.uri;
            console.log(obfid);
            $.ajax({
                url: obfid + "snapshots/"+imagename+".png",
                type: "PUT",
                headers: {"X-Humyo-Create-Dirs":"1"},
                contentType: "image/png",
                data: something,
                processData: false,
                success: function(data) {
                    callback("Upload successfully!") //return message to callback
                }
                
            })
        },
        error: function(data){
					callback("upload failed!")
                }
    })

}