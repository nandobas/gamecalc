export default 
class Simulation {
  constructor(maxFirstElement, simulationBase, numerOfRows, calcOperator) {
    this.simulations = [];
    this.maxFirstElement = maxFirstElement.value;
    this.simulationBase = simulationBase.value;
    this.numerOfRows = numerOfRows.value;
    this.calcOperator = calcOperator.value;
  }
  configSimulation(maxFirstElement, simulationBase, numerOfRows, calcOperator){
      this.maxFirstElement = this.validOrOne(maxFirstElement);
      this.simulationBase = this.validOrOne(simulationBase);
      this.numerOfRows = this.validOrOne(numerOfRows);
      this.calcOperator = calcOperator.value;
  }
  validOrOne(e){
    if(e.value == null || e.value == 0 || e.value == ''){
        e.value = 1;
    }
    return e.value;
  }
  buildSimulationExercicies(){
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
  
}