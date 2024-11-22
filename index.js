$(".item").click(function(){
move($(this));
});

function move(input){
    console.log(input);
    $(input).toggleClass("move-down");
    setTimeout(function(){
        console.log(input);
        $(input).toggleClass("move-down");
    },200)
}