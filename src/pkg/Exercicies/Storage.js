export default 
class Storage {
  responses = [];
  countAsserts = 0;
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