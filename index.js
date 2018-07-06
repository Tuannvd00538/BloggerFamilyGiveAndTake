const express = require('express');
const fs = require("fs");
const request = require('request');
const tokenFacebook = "";
const idGroup = "614878965530147";
var remindedID = {};
var message, idPost, idUserPost;

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

var app = express();
app.use(express.static('./public'));

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(8080, function(){
	console.log('Port 8080: cứ thấy số 200 trả về là thằng code server auto đẹp trai :)');
});