const express = require('express');
const fs = require("fs");
const request = require('request');
const tokenFacebook = "EAAAAUaZA8jlABACUWa8MMssPceglG8EBcXTs7MZCAzlaEHUhSZA0SyfahGYlgTf25Ee3WU3ux2k4U8TFArCKMjbZC0WZA3xLl0Fq14EQlGlDZC1KPIXh33k27tQHscwPo1IXY6n6FTlewoZAq4rCUCzUb04PMgxGzeHUq4hGDtISgZDZD";
const idGroup = "614878965530147";
var remindedID = {};
var message, idPost, idUserPost;

function checkUser(id) {
    var count = 0;
    listUser.forEach(function (value) {
        if (id == value) {
            count++;
        }
    });
    if (count != 0) {
        return false;
    } else {
        return true;
    }
}

async function post_comment(contentComment, idPost) {
    if (contentComment.trim() != "")
        await request("https://graph.facebook.com/" + idPost + "/comments/?method=post&message=" + encodeURI(contentComment) + "&access_token=" + tokenFacebook, (err, res, body) => {
            json = JSON.parse(body);
            console.log(json)
            if (!(json["error"] == undefined || json["error"] == null)) {
                console.log("COMMENT '" + contentComment + "' Thất bại");
            }

        });

}

async function delete_member(id) {
    await request('https://graph.facebook.com/' + idGroup + '/members?method=delete&member=' + id + '&access_token=' + tokenFacebook, (error, response, body) => {
        if (error) console.log(error);
        var data = JSON.parse(body);
        return data;
    });
}

async function checkLog(id) {
    await request('https://graph.facebook.com/v3.0/' + id + '/comments?access_token=' + tokenFacebook, (error, response, body) => {
        if (error) console.log(error);
        json = JSON.parse(body);
        if (!json.error) {
            let cmt = json.data[j].message;
            let reg = new RegExp(id, "g");
            let result = cmt.match(reg);
            return result == null;
        }
    });
}

function removeDuplicateUsingFilter(arr){
    let unique_array = arr.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });
    return unique_array
}

// Nhắc hashtag

setInterval(() => {
    try {
        request('https://graph.facebook.com/v3.0/' + idGroup + '/feed?fields=id,message,created_time,from&limit=10&access_token=' + tokenFacebook, (error, response, body) => {
            if (error) console.log(error);
            json = JSON.parse(body);
            if (!json.error) {

                for (var i = 0; i < json.data.length; i++) {
                    try {
                        message = json.data[i].message;
                        let checkHashtag = message.replace(/\n/g, '');
                        let hashtag = new RegExp("#BFG_");
                        
                        idPost = json.data[i].id;
                        idUserPost = json.data[i].from.id;
                        if (message != undefined && message != null && !hashtag.test(checkHashtag.toUpperCase()) && !remindedID.hasOwnProperty(idPost)) {
                            var comment = "Bạn @[" + idUserPost + ":0] ơi, bạn đã đọc nội quy chưa vậy. Thiếu HASHTAG rồi kìa: https://bit.ly/2KiHuPR 3:) >:(";
                            post_comment(comment, idPost);
                            console.log("Nhắc nhở bài viết: https://www.facebook.com/" + idPost);
                            remindedID[idPost] = true;
                            break;
                        }
                    } catch (error) {
                        console.log('error', error);
                    }
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}, 5000);


// Block chấm, hóng
var listPost = listUser = listCmt = [];
var commentBlock = ".|,|:|;|..|chấm|hóng";
var block = commentBlock.split("|");
setInterval(() => {
    try {
        request('https://graph.facebook.com/v3.0/' + idGroup + '/feed?fields=id,message,created_time,from&limit=10&access_token=' + tokenFacebook, (error, response, body) => {
            if (error) console.log(error);
            json = JSON.parse(body);
            if (!json.error) {
                for (var i = 0; i < json.data.length; i++) {
                    let idPost = json.data[i].id;
                    listPost.push(idPost);
                };
            }
        });
        listPost = removeDuplicateUsingFilter(listPost);
        if(listPost.length >= 100) {
            listPost = [];
        }
        if (listPost.length != 0) {
            for(var i = 0; i < listPost.length; i++) {
                request('https://graph.facebook.com/v3.0/' + listPost[i] + '/comments?access_token=' + tokenFacebook, (error, response, body) => {
                    if (error) console.log(error);
                    json = JSON.parse(body);
                    if (!json.error && json.length != 0) {
                        for (var j = 0; j < json.data.length; j++) {
                            var cmt = json.data[j].message;
                            var idUserCmt = json.data[j].from.id;
                            var nameUserCmt = json.data[j].from.name;
                            block.forEach(function (value) {
                                if (cmt.toUpperCase() == value.toUpperCase() && checkUser(idUserCmt)) {
                                    if (checkLog(idUserCmt)) {
                                        console.log('blockUser', idUserCmt);
                                        var cmtLog = "Kick User '" + nameUserCmt + " (fb.com/" + idUserCmt + ")' | Comment '" + cmt + "'";
                                        if (delete_member(idUserCmt)) {
                                            post_comment(cmtLog, '614878965530147_677883022563074');   
                                        }   
                                    }
                                }
                            });
                            break;
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
}, 30000);


var app = express();
app.use(express.static('./public'));

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(8080, function(){
	console.log('Port 8080: cứ thấy số 200 trả về là thằng code server auto đẹp trai :)');
});