
function getRandomCount(count) {
    var random = 0;
    do{
        random = Math.random();
    }
    while(random == 0);
    var time = new Date().getTime();
    var left = String(time).substr(0,10),right = String(random).substr(2,count-10);
    return left + right;
}
function timestamp(url){
    var getTimestamp=new Date().getTime();
    if(url.indexOf("?")>-1){
        url=url+"&stamp="+getTimestamp
    }else{
        url=url+"?timestamp="+getTimestamp
    }
    return url;
}
function getQueryObj() {
    var qs = location.search.length > 0 ? location.search.substring(1):"";
    var args = {},items = qs.length?qs.split("&"):[],item=null,name=null,value=null,
        i=0,len=items.length;
    for(;i<len;i++){
        item = items[i].split("=");
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);
        if(name.length){
            args[name] = value;
        }
    }
    return args;
}