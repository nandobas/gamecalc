export default 
class DataEquation{	
    setParameters(numberA, numberB, calcOperator) {
		this.numberA = numberA
		this.numberB = numberB
		this.calcOperator = calcOperator
	}
    setUserResult(result) {
		this.userResult = result.match(/\d+/)[0]
		console.log(result)
	}
	getParameterA(){
		return this.numberA
	}
	clean(){
		this.numberA = ''
		this.numberB = ''
		this.calcOperator = ''
		this.userResult = ''
	}
}