window.onload = function () {
    document.oncontextmenu=new Function("event.returnValue=false");
    document.onselectstart=new Function("event.returnValue=false");

    //定义一个函数判断是手机端还是pc端
    // function isMobile(){
    //     if(window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
    //         return true; // 移动端
    //     }else{
    //         return false; // PC端
    //     }
    // }

    // 提示
    // if (isMobile() != true) {
    //     alert("[Tips]填写问卷期间禁止缩放页面，否则将强制提交")
    // }

    // alert(isMobile())
    //如果用户在工具栏调起开发者工具，那么判断浏览器的可视高度和可视宽度是否有改变，如有改变则关闭本页面
    // var h = window.innerHeight, w = window.innerWidth;
    // window.onresize = function () {
    //     if ((h != window.innerHeight || w != window.innerWidth) && isMobile() != true) {
    //         alert("[Error]检测到异常行为，已自动提交")
    //         document.querySelector("form").submit();
    //     }
    // }

    // 随机字符串
    function randomString(length) {
        length = length || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
            a = t.length,
            n = "";
        for (i = 0; i < length; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }

    //监听整个页面的 copy 事件
    document.addEventListener('copy',function(e){
        // clipboardData 对象是为通过编辑菜单、快捷菜单和快捷键执行的编辑操作所保留的，也就是你复制或者剪切内容
        let clipboardData = e.clipboardData || window.clipboardData;
        // 如果 未复制或者未剪切，直接 return
        if(!clipboardData) return ;
        // Selection 对象 表示用户选择的文本范围或光标的当前位置。
        // 声明一个变量接收 -- 用户输入的剪切或者复制的文本转化为字符串
        let text = window.getSelection().toString();
        if(text){
            // 如果文本存在，首先取消默认行为
            e.preventDefault();
            // 通过调用 clipboardData 对象的 setData(format,data) 方法，设置相关文本
            // format 一个 DOMString 类型 表示要添加到 drag object 的拖动数据的类型
            // data 一个 DOMString 表示要添加到 drag object 的数据
            clipboardData.setData('text/plain', "不允许复制哦~" + randomString(text.length) + "不允许复制哦~")
        }
    })

    // Vue部分
    Vue.config.productionTip = false
    let vm = new Vue({
        el: "#Test_Box",
        data:{
            // 存储试题
            get_data: {}
        },
        created(){
            this.get_Question_data()
        },
        methods: {
            // 从接口获取试题
            get_Question_data(){
                axios
                    .get("/api/question")
                    .catch(function (error){
                        console.log("[获取试题时发生严重错误]",error.message)
                        alert("获取试题失败")
                        location.reload();
                    })
                    .then(function (data){
                        vm.get_data = data.data
                        document.querySelector(".test_questions").style.display = "block"
                        document.getElementsByClassName("loading_cover")[0].style.display = "none";
                    })
            }
        }
    })
}