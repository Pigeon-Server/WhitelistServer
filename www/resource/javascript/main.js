//字数计算
function ValueLength(input , display) {
    const input_box = document.querySelector(input);
    const display_box = document.querySelector(display);
    input_box.addEventListener("input",()=>{
        const value_length = input_box.value.length;
        display_box.innerHTML = value_length;
        if (value_length >= 30 && value_length <= 300) {
            display_box.style.color = "green";
        } else {
            display_box.style.color = "red";
        }
    });
}



