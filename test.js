
function* fill(){
    let result = yield timeout();
    yield "abc";
    return result.value;
}
let gf = fill();
function timeout(){
    setTimeout(function () {
        gf.next(123);
    },5000);
}
gf.next();
console.info();