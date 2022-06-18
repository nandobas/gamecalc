
<script setup>
import { ref, onMounted, defineComponent } from 'vue'
import StorageExercices from './pkg/Exercicies/Storage'
import Dataset from './pkg/Equation/Dataset'

const isRecording = ref(false)
const runApp = ref(false)
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
const sr = new Recognition()
const showModal = ref(false);
const showResult = ref(false);
const showConfig = ref(false);
const btnStart = ref(false);

//config
const numberOfRows = ref(10)
const maxFirstElement = ref(10)
const baseNumer = ref(4)
const speed = ref(80)
const calcOperator = ref('+')
const calcOperators = ref(['+','-','*'])

const simulationStorage = new StorageExercices(maxFirstElement, baseNumer, numberOfRows, calcOperator)
var SimulationList = simulationStorage.buildSimulationExercicies()

const dte = ref(new Dataset());
var myDataEquation = dte.value
myDataEquation.clean()

var actualIndex = 0
var actualRow = []
onMounted(() => {
	sr.continuous = true
	sr.interimResults = false

	sr.onstart = () => {
		console.log('SR Started')
		myDataEquation.clean()
		showResult.value=false

		runApp.value = true
		TogleStartStop()

		actualRow = SimulationList[actualIndex]
		myDataEquation.setParameters(actualRow.numberA, actualRow.numberB, actualRow.calcOperator)

		isRecording.value = true
		actualIndex++
	}
	sr.onend = () => {
		console.log('SR Stopped')
		isRecording.value = false

		let userResponse = simulationStorage.buildResponse(actualRow, myDataEquation.userResult)
		simulationStorage.pushResponse(userResponse)

		if (!runApp.value) {
			console.log('stoped')
			Stop()
			showResult.value=true
			return false
		}
		setTimeout(() => {
			showModal.value=false
			if(actualIndex < numberOfRows.value){
				setTimeout(() => sr.start(), getSpeed())
			}else{				
				Stop()
				showResult.value=true
			}
		}, getSpeed())
	}
	sr.onresult = (evt) => {
		for (let i = 0; i < evt.results.length; i++) {
			const result = evt.results[i]
			if (result.isFinal) CheckForCommand(result)
		}
		const t = Array.from(evt.results)
			.map(result => result[0])
			.map(result => result.transcript)
			.join('')
		
		myDataEquation.setUserResult(t)

		sr.stop()
	}
})
const CheckForCommand = (result) => {
	const t = result[0].transcript;
	if (t.includes('stop recording')) {
		sr.stop()
	} else if (
		t.includes('what is the time') ||
		t.includes('what\'s the time')
	) {
		sr.stop()
		alert(new Date().toLocaleTimeString())
		setTimeout(() => sr.start(), 100)
	}
}
const ToggleMic = () => {
	if (runApp.value) {
		runApp.value = false
		sr.stop()
	} else {
		SimulationList = simulationStorage.buildSimulationExercicies()
		actualIndex = 0

		sr.start()
	}
}

const TogleStartStop = () =>{
	let inputStart = document.getElementById('btnStart');
	if (runApp.value) {
        inputStart.classList.remove("btn-start")
        inputStart.classList.add("btn-stop")
	} else {
        inputStart.classList.remove("btn-stop")
        inputStart.classList.add("btn-start")
	}


}

const SetConfigStorage = () =>{
	showConfig.value = false
	simulationStorage.configStorage(maxFirstElement, baseNumer, numberOfRows, calcOperator)
}

function getSpeed(){
	let dif = 1000 - (speed.value * 10)
	return dif
}

const Stop = ()=>{
	myDataEquation.clean()
	actualIndex = 0
	actualRow = []
	runApp.value = false
	TogleStartStop()
}

const isNumber = (evt)=>{
	console.log('key press');	
	evt = (evt) ? evt : window.event;
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	if (String.fromCharCode(charCode).match(/[^0-9]/g)) {
		evt.preventDefault();
	} else {
		return true;
	}
}
</script>

<template>
	<div class="app wrapper">
		<div>
			<div class="display:flex;width:600px;" >		
				<button id="btnStart" :class="`mic btn-start`" @click="ToggleMic"></button>
				<button class="btn-configurar" @click="showConfig = true;showResult=false;" v-if="!runApp"></button>
			</div>

			<div class="container" >
				<div class="col1"></div>
				<div class="equation col6" >
				<div>
					<h3 v-if="myDataEquation.numberA">{{myDataEquation.numberA}} {{myDataEquation.calcOperator}} {{myDataEquation.numberB}}
				= {{myDataEquation.userResult}}</h3>
				</div>
				</div>
				<div class="col1"></div>
			</div>		


			<div class="container" v-if="showResult">
				<div class="col1" ></div>
				<div class="result col6">
					<div>
						<ul>
							<li v-for="linha in simulationStorage.listResponses()" :key="linha.id">
								<div>
									<div style="width:600px;float:left;display:block;">
										<span style="display: inline-flex;width: 20px;">{{linha.numberA}}</span> {{linha.calcOperator}} 
										<span style="width:80px">{{linha.numberB}}</span> = 
										<span style="width:80px" :class="linha.assert ? 'correto' : 'errado'">
										{{linha.userResult}}									
										</span>
										<span v-if="!linha.assert" class="atencao">correto: {{linha.result}}</span>			
									</div>
								</div>
							</li>
						</ul>
						<span>Você acertou: {{simulationStorage.countAsserts}}</span>			
					</div>
				<button
					class="modal-default-button"
					@click="showResult=false"
				>Ok</button>
				</div>
			</div>

			<div class="container" v-if="showConfig">
				<div class="col1" ></div>
				<div class="config col6">
					<div style="display: flow-root;">
						<span>Limite primeiro elemento:</span>
						<input 
							type="text" 
							v-model="maxFirstElement"
							maxlength="3"
							v-on:keypress="isNumber"
							style="float:right;width: 120px;"
						/>
					</div>
					<div style="display: flow-root;">
					<span>Base (segundo elemento):</span>
						<input 
							type="text" 
							v-model="baseNumer"
							maxlength="2"
							v-on:keypress="isNumber"
							style="float:right;width: 120px;"
						/>
					</div>
					<div style="display: flow-root;">
					<span>Operação:</span>
						<select style="width:120px;float:right" v-model="calcOperator">
							<option v-for="(item , index) in calcOperators" v-bind:key="index" :selected= "item == calcOperator" >
								{{item}}
							</option>
						</select>
					</div>
					<div style="display: flow-root;">
					<span>Número de questões:</span>
						<input 
							type="text" 
							v-model="numberOfRows"
							maxlength="2"
							v-on:keypress="isNumber"
							style="float:right;width: 120px;"
						/>
					</div>
					<div style="display: flow-root;">
					<span>Velocidade:</span>
						<input 
							type="range" 
							v-model="speed"
							style="float:right"
							min="1" max="99"
						/>
					</div>
				<button
					class="modal-default-button"
					@click="SetConfigStorage()"
				>Salvar</button>
				</div>
			</div>
		</div>

	</div>
</template>

<style>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: 'Fira sans', sans-serif;
}
html, body {
	background: #281936;
	color: #FFF;
  	height: 100%;
  	margin: 0;
}
#app {
  min-height: 100%;
  margin-bottom: -50px;
}
.footer {
	padding: 5px;
	background-color:#865eac;
	height:50px;
	width: 100%;
	text-align:center;
}

.config{
	width: 90%;
	background-color: #865eac;
}
.result{
	margin-top:10px;
	width: 90%;
	background-color: #865eac;
}
.container{
	display: flex;width:100%;
}
.col1{
	width: 8.333333333%;
}
.col3{
	width: 25%;
}
.col6{
	width: 83.333333334%;
}
.equation{
	margin-top:10%;
	font-size: 30pt;
	text-align: center;
}
    .correto{
        border-color: green;
        background-color: darkgreen;
        color:aliceblue
    }
    .errado{
        border-color: red;
        background-color: darkred;
        color:aliceblue
    }
    .atencao{
        border-color: rgb(229, 255, 0);
        background-color: rgb(240, 221, 56);
        color:rgb(29, 32, 34);
		margin-left: 10px;
    }
	.btn-start{
		border: none;
		width:140px;
		height: 120px;
		background-image: url('public/play-pause-button.png');
		background-repeat: no-repeat;
		background-position-y: -20px;
		background-position-x: -130px;
  		background-size: 280px 160px;
		background-color: transparent;
	}
	.btn-stop{
		border: none;
		width:140px;
		height: 120px;
		background-image: url('public/play-pause-button.png');
		background-repeat: no-repeat;
		background-position-y: -20px;
		background-position-x: -7px;
  		background-size: 280px 160px;
		background-color: transparent;
	}
	.btn-configurar{
		border: none;
		width:140px;
		height: 120px;
		background-image: url('public/configure-vector.png');
		background-repeat: no-repeat;
  		background-size: 100px;
		background-color: transparent;
		float:right;
	}
</style>