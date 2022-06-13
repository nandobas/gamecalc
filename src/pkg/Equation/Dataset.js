export default 
class DataEquation{	
    setParameters(numberA, numberB) {
		this.numberA = numberA
		this.numberB = numberB
	}
    setUserResult(result) {
		this.userResult = result
		console.log(result)
	}
	getParameterA(){
		return this.numberA
	}
	clean(){
		this.numberA = ''
		this.numberB = ''
		this.userResult = ''
	}
}