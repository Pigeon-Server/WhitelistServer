window.onload = function() {
    // VUE
    const vm = new Vue({
        el:"#index",
        data: {
            form: {
                Game_name: null,
                Username: null,
                Username_mode: null,
                Age: null,
                Playtime: null,
                Online_mode: null,
                Game_version: null,
                User_introduce: null,
                Rules: null,
                "g-recaptcha-response": null
            },
            verify_user_info: {
                Game_name: false,
                Username: false
            },
            BS_Config: {
                enable: null,
                URL: null,
                client_id: null
            },
            Username_max_length: 12,
            User_introduce_length: null,
            submit: false
        },
        // 执行时运行
        created(){
            // 加载验证码
            axios
                .get("/api/reCAPTCHA")
                .then(res=>{
                    if (res.data.enable) {
                        // if (false) {
                        window.grecaptcha.render("g-recaptcha", {
                            sitekey: res.data.reCAPTCHA_v2_key,
                            callback: this.return_recaptcha_token,
                            "expired-callback": this.time_out_recaptcha_token,
                            "error-callback": this.recaptcha_error
                        });
                    } else {
                        this.form["g-recaptcha-response"] = "false";
                        console.warn("服务端已禁用reCAPTCHA验证码");
                    }
                })
                .catch(err=>{
                    console.error("无法连接到验证码API")
                    document.querySelector("#Error").style.display = "block"
                    document.querySelector("#g-recaptcha-Error").style.display = "block"
                })
            // 加载BS登陆配置
            axios.get("/api/BS_login/config")
                .then(res=>{
                    if (res.data.enable) {
                        this.BS_Config.enable = true
                        this.BS_Config.URL = res.data.BS_host
                        this.BS_Config.client_id = res.data.Client_id
                    } else {
                        this.BS_Config.enable = false
                        console.warn("服务端已禁用BS登陆");
                    }
                })
                .catch(err=>{
                    console.error("无法加载BS登陆配置")
                    document.querySelector("#Error").style.display = "block"
                })
        },
        // 监听
        watch:{
            // 用户账户模式
            "form.Username_mode" (newdata) {
                if (newdata === "QQ") {
                    this.$refs.Username.type = "number"
                    this.Username_max_length = 12
                } else if (newdata === "KOOK") {
                    this.$refs.Username.type = "text"
                    this.Username_max_length = 20
                }
            },
            // 用户名-输入长度限制
            "form.Username" (newdata) {
                this.form.Username=newdata.slice(0,this.Username_max_length)
            },
            //个人介绍-长度识别
            "form.User_introduce" (newdata) {
                this.User_introduce_length = newdata.match(/\w/g).length;
                this.$refs.User_introduce_length_display.innerHTML = this.User_introduce_length
                if (this.User_introduce_length >= 30 && this.User_introduce_length <= 300) {
                    this.$refs.User_introduce_length_display.style.color = "green";
                    this.$refs.textarea_User_introduce.classList.remove("is-invalid")
                } else {
                    this.$refs.User_introduce_length_display.style.color = "red";
                    this.$refs.textarea_User_introduce.classList.add("is-invalid")
                }
            },
            // 是否拥有正版
            "form.Online_mode" (newdata) {
                if (newdata == "False") {
                    this.Game_version = "Java"
                    this.$refs.online_mode.classList.add("col-md-6")
                    this.form["BS_Login"] = null
                } else {
                    this.Game_version = null
                    this.$refs.online_mode.classList.remove("col-md-6")
                    delete this.form.BS_Login
                }
            }
        },
        methods:{
            // reCAPTCHA 返回
            return_recaptcha_token(token) {
                this.form["g-recaptcha-response"] = token
                document.querySelector("#time_out").style.display = "none"
                document.querySelector("#g-recaptcha-Error").style.display = "none"
            },
            // reCAPTCHA 超时
            time_out_recaptcha_token () {
                this.form["g-recaptcha-response"] = null
                document.querySelector("#time_out").style.display = "block"
            },
            // reCAPTCHA 错误
            recaptcha_error() {
                this.form["g-recaptcha-response"] = null
                document.querySelector("#g-recaptcha-Error").style.display = "block"
            },
            // 打开BS登陆窗口
            open_loginBS_window() {
                document.cookie = "BS-Login_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // 如果之前已经存在则清理
                const url = `${this.BS_Config.URL}/oauth/authorize?client_id=${this.BS_Config.client_id}&response_type=code&scope=`
                window.open(url,"","menubar = no,status = no,scrollbars = no,menubar = no,location = no") // 打开新窗口
                const check_BS_Login = setInterval(()=>{ // 检查是否已成功登录BS
                    const cookie = document.cookie;
                    if (cookie.includes("BS-Login_status=true")) {
                        console.debug("BS已登录")
                        document.cookie = "BS-Login_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // 清理cookie
                        this.form.BS_Login = true //写入变量以通过提交检测
                        this.$refs.BS_Login_Button.style.display = "none" // 关闭登录按钮
                        this.$refs.online_mode.classList.remove("col-md-6") // 恢复原有大小
                        clearInterval(check_BS_Login) // 停止轮询
                    } else if (cookie.includes("BS-Login_status=false")) {
                        alert("BS登录未成功，请检查是否已验证邮箱")
                        document.cookie = "BS-Login_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // 清理cookie
                        clearInterval(check_BS_Login) // 停止轮询
                    }
                },500)
            },
            // 验证必要参数是否被重复使用
            verify_values(event) {
                const ID = event.currentTarget.id
                const dom = document.getElementById(ID)
                if (this.form[ID]) {
                    axios({
                        url: "/api/judge",
                        params: {
                            [ID]: this.form[ID],
                        }
                    }).then(response =>{
                        document.querySelector("#Error").style.display = "None"
                        if (response.data.return == false) {
                            this.verify_user_info[ID] = true
                            document.querySelector("#QQ_and_KOOK-form-alert").style.display = "None"
                            dom.classList.remove("is-invalid");
                        } else {
                            this.verify_user_info[ID] = false
                            dom.classList.add("is-invalid");
                            document.querySelector("#QQ_and_KOOK-form-alert").style.display = "block"
                        }
                    }).catch((error)=>{
                        this.verify_user_info[ID] = false
                        document.querySelector("#Error").style.display = "block"
                        dom.classList.add("is-invalid");
                        console.error("[尝试校验"+ ID +"时发生严重错误]：\n",error.message)
                    })
                }
            },
            // 提交表单
            Submit_form(event) {
                event.stopPropagation
                let Status = true
                let form_data = {}
                for (verify in this.verify_user_info) {
                    console.log(verify,this.verify_user_info[verify])
                    if (!this.verify_user_info[verify]) {
                        Status = false
                        document.querySelector("#QQ_and_KOOK-form-alert").style.display = "block"
                    }
                }
                for (item in this.form) {
                    form_data[item] = this.form[item]
                    if (!this.form[item]) {
                        Status = false
                        document.querySelector("#form_error").style.display = "block"
                    }
                }
                if (Status) {
                    document.querySelector("#form_error").style.display = "none"
                    document.querySelector("#QQ_and_KOOK-form-alert").style.display = "none"
                    axios({
                        method: "post",
                        url: "/api/registration",
                        data: form_data,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(res=>{
                        if (res.data.return) {
                            location.replace("/api/measurement")
                        } else {
                            alert("服务器拒绝了提交请求")
                            document.querySelector("#Error").style.display = "block"
                        }
                    }).catch(err=>{
                        alert("提交失败\n",err)
                        document.querySelector("#Error").style.display = "block"
                    })
                }
            }
        }
    });
    // 空表单提示
    (() => {
        "use strict";
        const forms = document.querySelectorAll(".needs-validation");
        Array.from(forms).forEach((form) => {
            form.addEventListener(
                "submit",
                (event) => {
                    form.classList.add("was-validated");},
                true
            );
        });
    })();
}