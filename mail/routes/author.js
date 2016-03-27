var _ = require('lodash');
var Author = {
    authors: {
        "zhangsan": "张三",
        "lisi": "李四"
    },
    getAuthor: function(key){
        return this.authors[key]
    },
    formatAsArr: function(authors){
        var _this = this;
        var _authors = authors || _.clone(_this.authors);
        var _return = [];
        _.forEach(_authors,function(val,key){
            _return.push({
                id: key,
                name: val
            })
        });
        return _return;
    },
    formatAsObj: function(authors){
        var _this = this;
        var _authors = authors || _.clone(_this.authors);
        var _return = {};
        _.forEach(_authors,function(val,key){
            _return[key] = {
                id: key,
                name: val
            }
        });
        return _return;
    }

}

module.exports = Author;