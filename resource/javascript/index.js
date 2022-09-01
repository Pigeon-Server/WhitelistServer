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
            Username_max_length: 12,
            User_introduce_length: null,
            submit: false
        },
        created(){
            // 加载验证码
            this.load_reCAPTCHA()
        },
        methods: {
            // 加载验证码
            load_reCAPTCHA() {
                axios
                    .get("/api/reCAPTCHA")
                    .then(res=>{
                        if (res.data.enable) {
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
                        document.querySelector("#Error").style.display = "block"
                        document.querySelector("#g-recaptcha-Error").style.display = "block"
                    })
            },
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
            // 个人信息-长度
            User_introduce() {
                this.User_introduce_length = this.form.User_introduce.replace(/[\r\n]/g,"").replace(/\ +/g,"").length;
                this.$refs.User_introduce_length_display.innerHTML = this.User_introduce_length
                if (this.User_introduce_length >= 30 && this.User_introduce_length <= 300) {
                    this.$refs.User_introduce_length_display.style.color = "green";
                    this.$refs.textarea_User_introduce.classList.remove("is-invalid")
                } else {
                    this.$refs.User_introduce_length_display.style.color = "red";
                    this.$refs.textarea_User_introduce.classList.add("is-invalid")
                }
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
            // 账户类型更换
            Username_mode_change(event) {
                if (this.form.Username_mode === "QQ") {
                    this.$refs.Username.type = "number"
                    this.Username_max_length = 12
                } else if (this.form.Username_mode === "KOOK") {
                    this.$refs.Username.type = "text"
                    this.Username_max_length = 20
                }
            },
            // Fix 限制输入值长度（QQ/KOOK）
            Username_max() {
                this.form.Username=this.form.Username.slice(0,this.Username_max_length)
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