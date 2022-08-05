window.onload = function() {
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
    // Example starter JavaScript for disabling form submissions if there are invalid fields
    (() => {
        "use strict";
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        const forms = document.querySelectorAll(".needs-validation");
        // Loop over them and prevent submission
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
        // console.log(Game_name.values(),User.values())
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
        // if (input_list[0].classList.keys("is-invalid")&&input_list[1].classList.values())
    })();
}