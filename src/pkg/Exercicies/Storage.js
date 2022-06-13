export default 
class Storage {
    constructor(maxFirstElement, simulationBase, numerOfRows) {
      this.responses = [];
      this.simulations = [];
      this.countAsserts = 0;
      this.maxFirstElement = maxFirstElement.value;
      this.simulationBase = simulationBase.value;
      this.numerOfRows = numerOfRows.value;
    }
      configStorage(maxFirstElement, simulationBase, numerOfRows){
          this.maxFirstElement = maxFirstElement.value;
          this.simulationBase = simulationBase.value;
          this.numerOfRows = numerOfRows.value;
      }
      buildSimulationExercicies(){
          this.responses = [];
          this.simulations = [];
          let simulationBase = this.simulationBase;
          let numerOfRows = this.numerOfRows;
          
          for (let i=0; i<=numerOfRows; i++){
              let row = {"id":i, "numberA":this.randomNumber(), "numberB":simulationBase,"result":0, "userResult":''}
              let result = parseInt(row.numberA) + parseInt(row.numberB)
              row.result = result
              this.simulations.push(row)
          }
          return this.simulations;
      }
      randomNumber(){
          let max = this.maxFirstElement
          let min = 1
          return Math.floor(Math.random() * max) + min;
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