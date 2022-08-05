window.onload = function () {
    // Vue部分
    Vue.config.productionTip = false
    let vm = new Vue({
        el: "#confirm",
        data:{
            // 存储试题
            score: 0,
            status: "未知",
            user: null,
            userinfo: null
        },
        created(){
            this.validation()
        },
        methods: {
            // 从接口获取结果
            validation(){
                axios
                    .get("/api/result")
                    .catch(function (error){
                        console.log("[获取结果时发生严重错误]",error.message)
                    })
                    .then(function (data){
                        try {
                            vm.score = data.data.score
                            if (data.data.status == "SUCCESS") {
                                vm.status = "通过~"
                                document.querySelector(".confirm h1").style.color = "green"
                                vm.userinfo = data.data.userinfo
                                if (data.data.userinfo.User_Mode == "QQ") {
                                    vm.user = data.data.userinfo.User + "(QQ)"
                                } else {
                                    vm.user = data.data.userinfo.User + "(KOOK/开黑啦)"
                                }
                            } else if (data.data.status == "FAILURE") {
                                vm.status = "未通过"
                                document.querySelector(".confirm h1").style.color = "#b02a37"
                            } else if (data.data.status == "REFUSE") {
                                vm.status = "错误次数过多"
                                vm.userinfo = data.data.info
                                document.querySelector(".confirm h1").style.color = "#b02a37"
                            }
                            document.querySelector("#wait").remove()
                            document.getElementsByClassName("loading_cover")[0].style.display = "none";
                        } catch {
                            vm.status = "Error"
                            document.querySelector(".confirm h1").style.color = "#b02a37"
                            document.querySelector(".result>h4").innerHTML = "在请求API时发生错误，请自行刷新页面"
                            document.getElementsByClassName("loading_cover")[0].style.display = "none";
                        }
                    })
            }
        }
    })
}