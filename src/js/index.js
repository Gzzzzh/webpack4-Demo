import '../css/index.scss'
import $ from "jquery";
import '../utils/common'
import '../styles/common.scss'

$(function(){
    
    $.ajax({
        url:'/api/getSingleJoke',
        dataType:'json',
        data:{
            sid:28654780
        },
        success:function(resopnse) {
            alert('ajax请求成功，请打开控制台查看结果')
            console.log(resopnse);
        },
        error:function(error) {
            console.log(error);
        }
    })
})