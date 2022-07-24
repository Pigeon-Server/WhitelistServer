window.onload = function() {
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
                    // console.log("已失焦")
                    let input_name = obj.name
                    if (obj.value) {
                        axios({
                            url: "/api/judge",
                            params: {
                                [input_name]: obj.value,
                            }
                        }).then(response =>{
                            if(response.data.PlayerName){
                                switch (response.data.PlayerName){
                                    case false:{
                                        obj.classList.remove("is-invalid");
                                        break;
                                    }
                                    case true:{
                                        obj.classList.add("is-invalid");
                                        break;
                                    }
                                }
                            }else{
                                switch (response.data.User){
                                    case false:{
                                        obj.classList.remove("is-invalid");
                                        break;
                                    }
                                    case true:{
                                        obj.classList.add("is-invalid");
                                        break;
                                    }
                                }
                            }
                        }).catch((error)=>{
                            console.log("[严重错误]",error.message)
                        })
                    }
                }
            )
        })
        // console.log(Game_name.values(),User.values())
    })();
}