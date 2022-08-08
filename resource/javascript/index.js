// 激活提交按钮
function onButton() {
    document.querySelector("#sub").classList.remove("disabled")
}
window.onload = function() {
    let reCAPTCHA_v2_key = null;
    // 获取reCAPTCHA Key
    (()=>{
        axios
            .get("/api/reCAPTCHA")
            .then(data=>{
                reCAPTCHA_v2_key = data.data.reCAPTCHA_v2_key
                // 更改html
                document.querySelector(".g-recaptcha").setAttribute("data-sitekey",data.data.reCAPTCHA_v2_key)
                // 加载js
                let script = document.createElement('script');
                script.type = 'text/javaScript';
                script.src = 'https://recaptcha.net/recaptcha/api.js';
                document.getElementsByTagName('head')[0].appendChild(script);
            })
            .catch(err=>{
                alert("验证码加载失败")
                location.reload()
            })
    })();
    //字数计算
    const input_box = document.querySelector("#user_introduce");
    const display_box = document.querySelector("#user_introduce_len");
    input_box.addEventListener("input",()=>{
        const value_length = input_box.value.replace(/[\r\n]/g,"").replace(/\ +/g,"").length;
        display_box.innerHTML = value_length;
        if (value_length >= 30 && value_length <= 300) {
            display_box.style.color = "green";
            input_box.classList.remove("is-invalid")
        } else {
            display_box.style.color = "red";
            input_box.classList.add("is-invalid")
        }
    });
    //表单非空验证
    (() => {
        "use strict";
        const forms = document.querySelectorAll(".needs-validation");
        Array.from(forms).forEach((form) => {
            form.addEventListener(
                "submit",
                (event) => {
                    if (!form.checkValidity()) {
                        console.log(event,form)
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add("was-validated");
                },
                true
            );
        });
    })();
    // 验证游戏名和QQ是否被使用过
    (()=>{
        let Game_name = document.querySelector("#Game_name");
        let User = document.querySelector("#Username")
        let input_list = [Game_name,User]
        input_list.forEach((obj)=>{
            obj.classList.add("is-invalid");
            obj.addEventListener(
                "blur",
                (event)=>{
                    let input_name = obj.name
                    if (obj.value) {
                        axios({
                            url: "/api/judge",
                            params: {
                                [input_name]: obj.value,
                            }
                        }).then(response =>{
                            if (response.data.PlayerName == false) {
                                obj.classList.remove("is-invalid");
                            } else if (response.data.User == false) {
                                obj.classList.remove("is-invalid");
                            } else {
                                obj.classList.add("is-invalid");
                                document.querySelector("#QQ_and_KOOK-form-alert").style.display = "block"
                            }
                        }).catch((error)=>{
                            obj.classList.add("is-invalid");
                            console.log("[严重错误]",error.message)
                        })
                    }
                }
            )
        })
    })();
    // 阻止表单提交
    (()=>{
     let button = document.querySelector("#sub")
     let input_list = document.querySelectorAll("#Game_name,#Username")
     button.addEventListener(
         "click",
         (obj)=>{
         let Temp = false
         input_list.forEach((input_obj)=>{
             input_obj.classList.forEach((ClassName)=>{
                 if (ClassName == "is-invalid") {
                     Temp = true
                 }
             })
         })
         if (Temp) {
             obj.preventDefault()
             document.querySelector("#QQ_and_KOOK-form-alert").style.display = "block"
         } else {
             document.querySelector("#QQ_and_KOOK-form-alert").style.display = "None"
         }
     })
    })();
}