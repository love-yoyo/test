var express = require('express');
var path = require('path');
var router = express.Router();
var nodemailer = require("nodemailer");
var smtp = require('nodemailer-smtp-transport');
var EmailTemplate = require('email-templates').EmailTemplate;
var templateDir = path.resolve(__dirname, '..', 'mail_tpl');
var crypto = require('../security/util');

var getTime = function(reg) {
    var mydate = new Date(Date.now());
    var month = mydate.getMonth() + 1;
    var day = mydate.getDate();

    month = month<10 ? "0"+month : month;
    day = day<10 ? "0"+day : day;

    var time = mydate.getFullYear() + "" + month + day + mydate.getHours() + mydate.getMinutes() + mydate.getSeconds();
    if (reg) {
        reg = reg.replace("yyyy",time.substring(0,4));
        reg = reg.replace("MM",time.substring(4,6));
        reg = reg.replace("dd",time.substring(6,8));
        time = reg;
        console.log("time:"+time);
        console.log("reg:"+reg);
    }
    return time;
};

// 开启一个 SMTP 连接池
/*var smtpTransport = nodemailer.createTransport(smtp({
    host: "", // 主机
    port: 25, // SMTP 端口
    auth: {
        user: "", // 账号
        pass: crypto.decrypt("") // 密码
    }
}));*/

var smtpTransport = nodemailer.createTransport(smtp({
    service: "QQ", // 主机
    auth: {
        user: "", // 账号
        pass: "" // 密码
    }
}));

// 设置邮件内容
var setMailOptions = function(result){
    var suffix_img = path.join(__dirname, '../public/img/mail-suffix.png');
    return {
        from: "Will<will@qq.com>", // 发件地址
        to: "jack@qq.com", // 收件列表
        subject: "node生成邮件", // 标题
        html: result.html, // html 内容
        attachments: [{
            filename: 'mailSuffix.png',
            path: suffix_img,
            cid: 'attach_img@mailSuffix' //same cid value as in the html img src
        }]
    }
};

/* GET home page. */
router.post('/send/work', function(req, res, next) {
    console.log("enter in send method");
    var params = req.body;
    console.log(params);

    var tpl = new EmailTemplate(path.join(templateDir,'work'));
    tpl.render({
        works:params,
        beginObj:{
            call: "各位，晚上好",
            greet: "以下是mail的主题：",
            title: "任务列表"
        },
        sigature: {
            name:"will",
            company:"X-Space",
            addr:"地址：开普勒星球",
            phone:"手机：138 1234 1234",
            qq:"Q Q：12341234",
            email:"邮箱：will@qq.com"
        }
    }, function(err,result){
        if(err){
          console.log(err);
          res.send({"errCode":"0","errMsg":"send mail fail, please try again"})
          return;
        }
        var options = setMailOptions(result);
        try{
            smtpTransport.sendMail(options, function(error, response){
              if(error){
                console.log(error);
                res.send({"errCode":"0","errMsg":error})
              }else{
                console.log(error);
                res.send({"errCode":"0","errMsg":"邮件发送成功"})
              }
              smtpTransport.close(); // 如果没用，关闭连接池
            });
        }catch(e){
            res.send({"errCode":"0","errMsg":"send mail fail, please try again"})
            console.log(e);
        }
    })
});

router.post('/send/daily', function(req, res, next) {
    console.log("enter in send daily method");
    var params = req.body;
    console.log(params);

    var tpl = new EmailTemplate(path.join(templateDir,'dailyWork'));
    tpl.render({
        works:params,
        beginObj:{
            call: "各位，晚上好",
            greet: "以下是mail的主题：",
            title: "任务列表"
        },
        sigature: {
            name:"will",
            company:"X-Space",
            addr:"地址：开普勒星球",
            phone:"手机：138 1234 1234",
            qq:"Q Q：12341234",
            email:"邮箱：will@qq.com"
        }
    }, function(err,result){
        if(err){
          console.log(err);
          res.send({"errCode":"0","errMsg":"send mail fail, please try again"})
          return;
        }
        console.log(result.html);
        var options = setMailOptions(result);
        try{
            smtpTransport.sendMail(options, function(error, response){
              if(error){
                console.log(error);
                res.send({"errCode":"0","errMsg":error})
              }else{
                console.log(error);
                res.send({"errCode":"0","errMsg":"邮件发送成功"})
              }
              smtpTransport.close(); // 如果没用，关闭连接池
            });
        }catch(e){
            console.log(e);
            res.send({"errCode":"0","errMsg":"send mail fail, please try again"})
        }
    })
    
});


module.exports = router;
