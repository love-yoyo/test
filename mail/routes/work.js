var express = require('express');
var router = express.Router();
var lowdb = require('lowdb');
var storage = require('lowdb/file-sync');
var querystring = require("querystring");
var fs = require('fs');
var _ = require('lodash');
var author = require('./author');


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
    walk("./db", function(err, results) {
        if (err) throw err;
        // console.log(results);
        var result = [];
        for (var i = 0; i < results.length; i++) {
            var val = results[i];
            val = val.replace(/^\.\.\//, '').replace(/^\.\//, '');
            console.log('path:' + val);
            var db = low(val);
            var table = db('works')
                        .chain()
                        .filter({complete:"2"})
                        .sortBy('modifyTime')
                        .value();
            table = _.clone(table);
            _.forEach(table, function(val,key){
                const _name = val['author'] ;
                val['author'] = _author[_name];
            })
            console.log(table);
            result = _.concat(result,table);
            console.log(result);
        }
        res.send(JSON.stringify(result));
    });
});

router.get('/add.html', function(req, res, next){
    res.render('add',{
        authors: author.formatAsArr()
    });
})

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
    var db = low('db/work_'+_author+'.json');

    params.remark = params.remark || "";

    var _find = db('works').find(params);

    if (_find) {
        res.send({"errCode":"0","errMsg":"您已添加"});
    } else{
        var _crrtTime = getTime();
        params.cerateTime = _crrtTime;
        params.modifyTime = _crrtTime;
        params.compete = "2"; //0: completed,1: not complete, 2: in progress

        db('works').push(params);
        res.send({"errCode":"0","errMsg":"添加成功"});
    }
});

module.exports = router;
