function checkauth(callback) {
    //delete all localhost cookies
    chrome.cookies.getAll({
        domain: "10.1.193.204"
    }, function(cookies) {
        console.log(cookies);
        console.log("cookie array length: "+cookies.length);

        if (cookies.length == 2) callback(1)	//check cookie array whether it is 2 objects, if yes return 1, else 0
        else callback(0)
    });

}

function login(account, password, callback) {
    $.ajax({
        url: "https://10.1.193.204/api/v2/usersession",
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
                console.log(res);
            } else {
                console.log(res);
                callback(res['Code']); //return error message 
            }
        }

    })

}

function logout(callback) {
    //delete all localhost cookies
    chrome.cookies.getAll({
        domain: "10.1.193.204"
    }, function(cookies) {
        for (var i = 0; i < cookies.length; i++) {
            chrome.cookies.remove({
                url: "https://10.1.193.204/" + cookies[i].path,
                name: cookies[i].name
            });
        }
        //callback("已登出")
        //callback("已登出");
        callback() // delete successfully and excute the callback function you want

    });
}

function upload(imagename, something, callback) {
    //var imgData = JSON.stringify(something);
    $.ajax({
        url: "https://10.1.193.204/api/v2/home",
        type: "GET",	// you will get url like "https://10.1.193.204/api/v2/Hzw" personal root folder 
        dataType: "html",
        success: function(data) {
            var res = JSON.parse(data);
            var obfid = res.uri;
            console.log(obfid);
            //console.log(data)
            $.ajax({
                url: obfid + "snapshots/"+imagename+".png",
                type: "PUT",	//put 
                headers: {"X-Humyo-Create-Dirs":"1"},
                contentType: "image/png",
                data: something,//imgData,
                processData: false,
                success: function(data) {
                    // var res = JSON.parse(data);
                    //var x=res.uri;
                    //console.log(x);
                    //console.log(data)
                    callback("upload successfully!") //return message to callback
                }
                

            })

        },
        error: function(data){
					callback("upload failed!")
                }

    })

}