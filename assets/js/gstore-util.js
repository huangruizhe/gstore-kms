var global_ip = "localhost";
var global_port = "9000";
var global_dbname = "null";

// 清除两边的空格 
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, '');
};

// 判断字符串长度并且区分中文和英文
String.prototype.gblen = function() {  
  var len = 0;  
  for (var i=0; i<this.length; i++) {  
    if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {  
       len += 2;  
     } else {  
       len ++;  
     }  
   }  
  return len;  
}

// 生成随机字符串序列
function randomString (len) {
    　　len = len || 32;
    　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    　　var maxPos = $chars.length;
    　　var pwd = '';
    　　for (i = 0; i < len; i++) {
        　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return pwd;
}

function getURL (url, obj) {
    url = url.substring(0, url.lastIndexOf('.html') + 5);
    url = url + "?";
    for (var key in obj) {
        // console.log(key + ":" + obj[key]);
        url += (key + "=" + obj[key] + "&");
    }
    url = url.substring(0, url.length-1);
    return url;
}

function parseURL (url) {
    var obj = {};

    var searchURL = window.location.search;
    if (searchURL.length > 0) {
        searchURL = searchURL.substring(1, searchURL.length);  
        var params = searchURL.split("&");
        for (var p in params) {
            var pp = params[p].split('=');
            var k = pp[0];
            var v = pp[1];
            obj[k] = v;
        }
    }
    
    return obj;
}
