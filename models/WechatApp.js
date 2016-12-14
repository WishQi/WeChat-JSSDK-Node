/**
 * Created by Ambrose on 2016/12/14.
 */
var Btn = document.getElementById('content');

Btn.onclick = voiceMute;

function voiceMute(){
    if(Btn.value == "record") {
        Btn.value = "activated";
    } else {
        Btn.value = "record";
    }
}