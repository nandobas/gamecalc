export default
class service{ 
    constructor(w){
        const sr = w.SpeechRecognition || w.webkitSpeechRecognition
        this.recognition = new sr();
        
        this.recognition.continuous = true
        this.recognition.interimResults = false
    }
    getRecognition(){
        return this.recognition;
    }
    start(){
        this.recognition.start();
    }
    stop(){
        this.recognition.stop;
    }

}