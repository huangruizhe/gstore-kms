// 清除两边的空格 
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, '');
};

// 生成随机字符串序列
function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

// ****************** 以下函数与事件和操作相关 ******************

function doInsertRow(tb, title, descritpion) {
    var dataId = randomString(5);    
    var rowHtml = `<td>${title}</td> <td>${descritpion}</td> <td align=\"center\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-pencil\"></span></button></td> <td align=\"center\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-trash\"></span></button></td>`;

    // console.log(title);
    // console.log(descritpion);

    var tr = document.createElement('tr');
    tr.innerHTML = rowHtml;

    tb.prepend(tr);
}

function doDelRow(tr) {
    tr.fadeOut('slow', () => tr.remove());
}

function doUpdateRow(tr, title, descritpion) {
    tr.find('td:first-child').text(title);
    tr.find('td:nth-child(2)').text(descritpion);
}

var buttonId = undefined;


