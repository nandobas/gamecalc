export default 
class Storage {
    constructor(maxFirstElement, simulationBase, numerOfRows, calcOperator) {
      this.responses = [];
      this.simulations = [];
      this.countAsserts = 0;
      this.maxFirstElement = maxFirstElement.value;
      this.simulationBase = simulationBase.value;
      this.numerOfRows = numerOfRows.value;
      this.calcOperator = calcOperator.value;
    }
      configStorage(maxFirstElement, simulationBase, numerOfRows, calcOperator){
          this.maxFirstElement = maxFirstElement.value;
          this.simulationBase = simulationBase.value;
          this.numerOfRows = numerOfRows.value;
          this.calcOperator = calcOperator.value;
      }
      buildSimulationExercicies(){
          this.responses = [];
          this.simulations = [];
          let simulationBase = this.simulationBase;
          let numerOfRows = this.numerOfRows;
          let calcOperator = this.calcOperator;
          var operators = {
            '+': function(a, b) { return a + b },
            '-': function(a, b) { return a - b },
            '*': function(a, b) { return a * b },
            '/': function(a, b) { return a / b },
            };
        
          
          for (let i=0; i<=numerOfRows; i++){             
            let numberA = this.randomNumber()
              let row = {"id":i, "numberA":this.randomNumber(), "numberB":simulationBase, "calcOperator":calcOperator,"result":0, "userResult":''}
              var a = parseInt(row.numberA)
              var b = parseInt(row.numberB)
              let result = operators[calcOperator](a, b);
              row.result = result
              this.simulations.push(row)
          }
          return this.simulations;
      }
      randomNumber(){
        let simulationBase = this.simulationBase;
        let calcOperator = this.calcOperator;

        let max = this.maxFirstElement
        let min = 1
        let random = Math.floor(Math.random() * max) + min;

        if (calcOperator === '-'){
            random = 0
            console.log('operator -')
            while (random < simulationBase) {
                random = Math.floor(Math.random() * max) + min;
            }
        }
        return random
      }
      buildResponse(row, response){
          row.userResult = response;
          return row;
      }
      pushResponse(response){
          this.responses.push(response)
      }
      listResponses(){
          this.countAsserts = 0;
          
          for (let i=0; i < this.responses.length; i++){
              this.responses[i].assert = false
              if (this.responses[i].result == this.responses[i].userResult){
                  this.responses[i].assert = true
                  this.countAsserts++
              }
          }
          return this.responses;
      }
  
}