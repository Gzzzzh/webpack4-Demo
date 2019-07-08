import $ from 'jquery'
import "@/js/libs/jquery.easyui.min.js"
import "@/js/libs/easyui-lang-zh_CN.js"

import "@/css/styles/normalize.css"
import "@/css/lib/themes/default/easyui.css"
import "@/css/lib/themes/icon.css"

let cols = [
    {field:'select',checkbox:true},
    {field:"name",title:'姓名',width:100,editor:{
        type:'text',
        options:{
            required:true
        }
    }},
    {field:"age",title:'年龄',width:100,editor:'numberbox'},
    {field:"sex",title:'性别',align:"center",width:100,editor:'text',
                formatter:function(value,row,index){
                    if(value.length>10) {
                        let content = `<span title="${value}">${value}</span>`
                        return content
                    } else {
                        return value
                    }
                    
                }},
    {field:'action',title:'操作',width:70,align:'center',
                formatter:function(value,row,index){
                    if (row.editing){
                        var s = '<a href="javascript:;" class="saverow">确定</a> ';
                        var c = '<a href="javascript:;" class="cancelrow">取消</a>';
                        return s+c;
                    } else {
                        var e = '<a href="javascript:;" class="editrow">编辑</a> ';
                        var d = '<a href="javascript:;" class="deleterow">删除</a>';
                        
                        return e+d;
                    }
                }
            }
 ]
 let data = [
    {
        name:'tom',
        age:12,
        sex:'malesdd gsdfg sdfg dfg dfg sdfg dfg dsfg df gdfg df gdsfg df gdf sdg dsfgdfgdfg sdf sdfs',
 
    },
    {
        name:'tom1',
        age:123,
        sex:'male'
    },
    {
        name:'tom2',
        age:120,
        sex:'male'
    },
    {
        name:'tom',
        age:12,
        sex:'male'
    },
    {
        name:'tom1',
        age:123,
        sex:'male'
    },
    {
        name:'tom2',
        age:120,
        sex:'male'
    },
    {
        name:'tom',
        age:12,
        sex:'male'
    },
    {
        name:'tom1',
        age:123,
        sex:'male'
    },
    {
        name:'tom2',
        age:120,
        sex:'male'
    },
    {
        name:'tom2',
        age:120,
        sex:'male'
    },
 
 ]
$(function(){
    init()
    bindEvent()
    init_edit_delete_btn()
})

function bindEvent () {
    $('#getPic').on('click',function(){
        console.log($('#pic').next().find('input[id^="filebox_file_id_"]')[0].files);
    })
    $('#insert').on('click', inserted);
    $('#clearsd').on('click', clearsd)
}
function getRowIndex(target){
    var tr = $(target).closest('tr.datagrid-row');
    return parseInt(tr.attr('datagrid-row-index'));
} 
function inserted(){
   let name = $('#name').textbox('getValue')
   let age = $('#age').numberbox('getValue')
   let sex = $('#sex').textbox('getValue')
   let person = {name,age,sex}
   $('#dg').datagrid('insertRow',{
       index:0,
       row:person
   })
   clearsd()
   init_edit_delete_btn() 
}
function clearsd(){
   $('#name').textbox('clear')
   $('#age').numberbox('clear')
   $('#sex').textbox('clear')
   $('#dlg').dialog('close')
}

function init_edit_delete_btn(){
    $('.deleterow').off()
    $('.editrow').off()
    $('.editrow').on('click',function({currentTarget}){
        $('#dg').datagrid('beginEdit',getRowIndex(currentTarget))
    })
    $('.deleterow').on('click',function({currentTarget}){
        $.messager.confirm('Confirm','Are you sure?',function(r){
            if (r){
                $('#dg').datagrid('deleteRow', getRowIndex(currentTarget));
            }
        });
    })
}
function init_save_cancel_btn (){
    $('.saverow').off()
    $('.cancelrow').off()
    $('.saverow').on('click',function({currentTarget}){
        $('#dg').datagrid('endEdit',getRowIndex(currentTarget))
    })
    $('.cancelrow').on('click',function({currentTarget}){
        $('#dg').datagrid('cancelEdit',getRowIndex(currentTarget))
    })
}
function init(){
    $('#dg').datagrid({
       title:'第一中学',
       data,
       resizeHandle:'right',
       columns:[cols],
       striped:true,
       pagination:true,
       rownumbers:true,
       fitColumns:true,
       singleSelect:true,
       toolbar: [{
       iconCls: 'icon-add',
       handler: function(){
           $('#dlg').dialog('open')
       }
   },'-',{
       iconCls: 'icon-save',
       handler: function(){
           $('#dg').datagrid('acceptChanges')
       }
   },'-',{
       iconCls: 'icon-undo',
       handler: function(){
           $('#dg').datagrid('rejectChanges')
       }
   },'-',{
       iconCls: 'icon-search',
       handler: function(){
           console.log('getChanges  update');
           console.log($('#dg').datagrid('getChanges','updated'));
           console.log('getChanges deleted');
           console.log($('#dg').datagrid('getChanges','deleted'));
           console.log('getChanges inserted');
           console.log($('#dg').datagrid('getChanges','inserted'));
       }
   }],
       rowStyler:function(index,row){
           if(row.age<100){
               return 'color:red'
           }
       },
       onSelect:function(index,row){
           console.log(index+'---'+typeof row.age);
       },
       onBeforeEdit:function(index,row){
           row.editing = true;
           console.log(row);
           console.log('onBeforeEdit');
           $(this).datagrid('refreshRow', index);
           $('.saverow').off()
           $('.cancelrow').off()
           init_save_cancel_btn()
           
       },
       onAfterEdit:function(index,row,change){
           row.editing = false;
           console.log(row);
           console.log(change);
           console.log('onAfterEdit');
           $(this).datagrid('refreshRow', index);
           
           init_edit_delete_btn()
           
       },
       onCancelEdit:function(index,row){
           row.editing = false;
           console.log(row);
           console.log('onCancelEdit');
           $(this).datagrid('refreshRow', index);
           
           init_edit_delete_btn()
           
       },
       onDblClickCell:function(index,field,value){
           $(this).datagrid('beginEdit',index)
       }
    })
    $("#dg").datagrid('getPager').pagination({
       showPageList:false,
       onRefresh:function(){
           alert('refresh')
       }
   });
   $('#ss').searchbox({
    prompt:'搜索',
    searcher:function(value,name){
        alert(value)
    }
    
})
}

