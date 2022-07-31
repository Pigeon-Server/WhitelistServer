window.onload = function () {

    document.oncontextmenu=new Function("event.returnValue=false");
    document.onselectstart=new Function("event.returnValue=false");

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
                    })
                    .then(function (data){
                        vm.get_data = data.data
                        document.querySelector(".test_questions").style.display = "block"
                    })
            }
        }
    })
}