var express = require('express');
var router = express.Router();
var lowdb = require('lowdb');
var storage = require('lowdb/file-sync');
var querystring = require("querystring");
var fs = require('fs');
var _ = require('lodash');
var author = require('./author');
const uuid = require('uuid');


function low(val) {
    return lowdb(val, { storage });
}

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    if (file.substring(0, 2) != ".~") {
                        results.push(file);
                    }
                    next();
                }
            });
        })();
    });
};

var getTime = function() {
    var mydate = new Date(Date.now());
    var month = mydate.getMonth() + 1;
    var day = mydate.getDate();

    month = month<10 ? "0"+month : month;
    day = day<10 ? "0"+day : day;

    var time = mydate.getFullYear() + "" + month + day + mydate.getHours() + mydate.getMinutes() + mydate.getSeconds();
    return time;
};


/* GET home page. */
router.get('/all', function(req, res, next) {
    console.log("enter in this");
    var _author = author.formatAsObj();
    var _time = getTime().substring(0,8);
    var db = low('db/daily/'+_time+'.json');
    var table = db('works').value();
    table = _.clone(table);
    console.log(table);
    _.forEach(table,function(val,key){
        var _name = val['author'];
        val['author'] = _author[_name];
    })
    res.send(JSON.stringify(table));
});

router.get('/add.html', function(req, res, next){
    res.render('daily_add',{
        authors: author.formatAsArr()
    });
});


router.post('/add', function(req, res, next) {
    console.log("*********************************");
    console.log(req);
    console.log("*********************************");

    var params = req.body;
    var _requireId = params.requireId;
    var _requireDesc = params.requireDesc;
    var _lastProgress = params.lastProgress;
    var _todayProgress = params.todayProgress;
    var _todayDesc = params.todayDesc;
    var _remark = params.remark;
    console.log(_remark);
    /**
     * TODO: check all params
     */

    var _author = params.author;
    var db = low('db/daily/'+getTime().substring(0,8)+'.json');

    params.remark = params.remark || "";

    var _find = db('works').find(params);

    if (_find) {
        res.send({"errCode":"0","errMsg":"您已添加"});
    } else{
        var _crrtTime = getTime();
        params.cerateTime = _crrtTime;
        params.modifyTime = _crrtTime;
        params.compete = "2"; //0: completed,1: not complete, 2: in progress
        params.id = uuid();

        db('works').push(params);
        res.send({"errCode":"0","errMsg":"添加成功"});
    }
});

router.post("/delete",function(req,res,next){
    var params = req.body;
    var db = low('db/daily/'+getTime().substring(0,8)+'.json');
    var a = db('works').remove(params);
    console.log(a);
    res.send({"errCode":"0","errMsg":"添加成功"});

});

router.post("/update",function(req,res,next){
    var params = req.body;
    var db = low('db/daily/'+getTime().substring(0,8)+'.json');
    var a = db('works').update(params);
    db('works')
      .chain()
      .find({ id: params.id })
      .assign(params)
      .value();
    res.send({"errCode":"0","errMsg":"更新成功"});

});

module.exports = router;
