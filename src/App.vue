<script setup>
import {ref, onMounted} from 'vue'
import Simulation from './pkg/Exercicies/Simulation'
import Storage from './pkg/Exercicies/Storage'
import Dataset from './pkg/Equation/Dataset'

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
const speechRecognition = new Recognition()
const isRecording = ref(false)
const runApp = ref(false)
const showModal = ref(false);
const showResult = ref(false);
const showConfig = ref(false);

//config
const numberOfRows = ref(5)
const maxFirstElement = ref(10)
const baseNumer = ref(4)
const speed = ref(80)
const calcOperator = ref('+')
const calcOperators = ref(['+','-','*'])

const simulation = new Simulation(maxFirstElement, baseNumer, numberOfRows, calcOperator)
var SimulationList = simulation.buildSimulationExercicies()

const storage = new Storage()

const dte = ref(new Dataset());
var myDataEquation = dte.value
myDataEquation.clean()

var actualIndex = 0
var actualRow = []
onMounted(()=>{
	speechRecognition.continuous = true
	speechRecognition.interimResults = false

	speechRecognition.onstart = ()=>{
		onStart()
	}
	speechRecognition.onend = ()=>{
		console.log('speech recognition stopped')

		if (!runApp.value) {
			console.log('stoped')
			Stop()
			showResult.value=true
			return false
		}
		
		onEnd()
	}
	speechRecognition.onresult = (evt)=>{
		onResult(evt)
		speechRecognition.stop()
	}


})

const ToggleMic = () => {
	if (runApp.value) {
		runApp.value = false
		speechRecognition.stop()
	} else {
		SimulationList = simulation.buildSimulationExercicies()
		actualIndex = 0
		speechRecognition.start()
	}
}

const TogleStartStop = () =>{
	let inputStart = document.getElementById('btnStart');
    inputStart.innerHTML="Iniciar"
	if (runApp.value) {
        inputStart.innerHTML="Parar"
	}
}

const Stop = ()=>{
	myDataEquation.clean()
	actualIndex = 0
	actualRow = []
	runApp.value = false
	TogleStartStop()
}

function onStart() {
  console.log('speech recognition started')
  myDataEquation.clean()
  showResult.value=false

  runApp.value=true
  TogleStartStop()

  actualRow=SimulationList[actualIndex]
  myDataEquation.setParameters(actualRow.numberA, actualRow.numberB, actualRow.calcOperator)

  isRecording.value=true
  actualIndex++
}

function onEnd() {
  isRecording.value=false

  let userResponse=storage.buildResponse(actualRow, myDataEquation.userResult)
  storage.pushResponse(userResponse)

  setTimeout(() => {
    showModal.value=false
    if(actualIndex<numberOfRows.value) {
      setTimeout(() => speechRecognition.start(), getSpeed())
    } else {
      Stop()
      showResult.value=true
    }
  }, getSpeed())
}

function onResult(evt) {
  for(let i=0;i<evt.results.length;i++) {
    const result=evt.results[i]
    if(result.isFinal)
      CheckForCommand(result)
  }
  const t=Array.from(evt.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('')

  myDataEquation.setUserResult(t)
}

const CheckForCommand = (result) => {
	const t = result[0].transcript;
	if(t.includes('parar')){
		ToggleMic()
	}else if(t.includes('tocar funk')){
		ToggleMic()
	 	window.open('https://www.youtube.com/watch?v=9cmuP8OBnnA', '_blank');
	}
}

const isNumber = (evt)=>{
	evt = (evt) ? evt : window.event;
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	if (String.fromCharCode(charCode).match(/[^0-9]/g)) {
		evt.preventDefault();
	} else {
		return true;
	}
}

const SetConfigSimulation = () =>{
	showConfig.value = false
	simulation.configSimulation(maxFirstElement, baseNumer, numberOfRows, calcOperator)
}

function getSpeed(){
	let dif = 1000 - (speed.value * 10)
	return dif
}

</script>


<template>
	<div class="app">
		<div style="display:flex; width: 600px;">
			<button id="btnStart" class="btn" @click="ToggleMic">Iniciar</button>
			<button id="btnConfigurar" :class="`btn`" @click="showConfig = true;showResult=false;" v-if="!runApp">Configurar</button>
		</div>


		<div class="container" >
			<div class="col1"></div>
			<div class="equation col6" >
			<div>
				<h3 
					v-if="myDataEquation.numberA">
					{{myDataEquation.numberA}} 
					{{myDataEquation.calcOperator}} 
					{{myDataEquation.numberB}}
					= 
					{{myDataEquation.userResult}}
				</h3>
			</div>
			</div>
			<div class="col1"></div>
		</div>
		
		<div class="container" v-if="showResult">
			<div class="col1" ></div>
			<div class="result col6">
				<div>
					<ul>
						<li v-for="linha in storage.listResponses()" :key="linha.id">
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
					<span>Você acertou: {{storage.countAsserts}}</span>			
				</div>
			<button
				class="btn"
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
					class="btn"
					@click="SetConfigSimulation()"
				>Salvar</button>
			</div>
		</div>

	</div>
</template>

<style lang="css">
	@import "./App.css";
</style>