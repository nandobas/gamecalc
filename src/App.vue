<script setup>
import { ref, onMounted, defineComponent } from 'vue'
const transcript = ref('')
const equation = ref('')
const isRecording = ref(false)
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
const sr = new Recognition()
const showModal = ref(false);
const showResult = ref(false);
const showConfig = ref(false);

//config
const numberOfRows = ref(5)
const maxFirstElement = ref(10)
const baseNumer = ref(2)

class StorageExercices {
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

const simulationStorage = new StorageExercices(maxFirstElement, baseNumer, numberOfRows)
var SimulationList = simulationStorage.buildSimulationExercicies()

var actualIndex = 0
var actualRow = []
onMounted(() => {
	sr.continuous = true
	sr.interimResults = false

	sr.onstart = () => {
		console.log('SR Started')
		showModal.value=true
		
		equation.value = ''	
		transcript.value = ''

		actualRow = SimulationList[actualIndex]
		equation.value = actualRow

		isRecording.value = true
		actualIndex++
	}
	sr.onend = () => {
		console.log('SR Stopped')
		isRecording.value = false


		let userResponse = simulationStorage.buildResponse(actualRow, transcript.value)
		simulationStorage.pushResponse(userResponse)
		console.log(userResponse)

		setTimeout(() => {
			showModal.value=false
			if(actualIndex < numberOfRows.value){
				setTimeout(() => sr.start(), 900)
			}else{
				showResult.value=true
			}
		}, 1000)
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
		
		transcript.value = t

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
	if (isRecording.value) {
		sr.stop()
	} else {
		SimulationList = simulationStorage.buildSimulationExercicies()
		actualIndex = 0

		sr.start()		
	}
}

const SetConfigStorage = () =>{
	showConfig.value = false
	simulationStorage.configStorage(maxFirstElement, baseNumer, numberOfRows)
}


import Modal from './components/ModalDialog.vue'
</script>

<template>
	<div class="app">
    <div>

		<div style="display: flex;width:600px;">
			<button :class="`mic`" @click="ToggleMic">Iniciar</button>
			<button @click="showConfig = true">Configurar</button>
		</div>
		

		<Teleport to="body">
			<!-- use the modal component, pass in the prop -->
			<modal :show="showModal" @close="showModal = false">
			<template #header>
				<h3>{{equation.numberA}} + {{equation.numberB}}</h3>
			</template>
			<template #body>
				<div>{{transcript}}</div>
			</template>
			</modal>

			<modal :show="showResult" @close="showResult = false">
			<template #header>
				<h3>Resultado</h3>
			</template>
			<template #body>
				<div>
					<ul>
						<li v-for="linha in simulationStorage.listResponses()" :key="linha.id">
							<div>
								<div style="width:600px;float:left;display:block;">
									<span style="display: inline-flex;width: 20px;">{{linha.numberA}}</span> + 
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
			</template>
			</modal>

			<modal :show="showConfig" @close="SetConfigStorage">
			<template #header>
				<h3>Configurar</h3>
			</template>
			<template #body>
				<div style="display: flow-root;">
					<span>Número máximo do primeiro elemento:</span>
					<input 
						type="text" 
						v-model="maxFirstElement"
						style="float:right"
                	/>
				</div>
				<div style="display: flow-root;">
				<span>Base (segundo elemento):</span>
					<input 
						type="text" 
						v-model="baseNumer" 
						style="float:right"
                	/>
				</div>
				<div style="display: flow-root;">
				<span>Número de questões:</span>
					<input 
						type="text" 
						v-model="numberOfRows"
						style="float:right"
                	/>
				</div>
			</template>
			</modal>
		</Teleport>



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
body {
	background: #281936;
	color: #FFF;
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
</style>