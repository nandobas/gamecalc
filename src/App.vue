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

		runApp.value = true

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
			return false
		}
		setTimeout(() => {
			showModal.value=false
			if(actualIndex < numberOfRows.value){
				setTimeout(() => sr.start(), getSpeed())
			}else{				
				Stop()
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
	showResult.value=true
}


import Modal from './components/ModalDialog.vue'
</script>

<template>
	<div class="app">
    <div>

		<div style="display: flex;width:600px;">
			<button :class="`mic`" @click="ToggleMic" v-if="!runApp">Iniciar</button>
			<button @click="showConfig = true" v-if="!runApp">Configurar</button>
			<button @click="ToggleMic" v-if="runApp">Parar</button>
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
		

		<Teleport to="body">
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
				<span>Operação:</span>
					<select style="width:181px;float:right" v-model="calcOperator">
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
						style="float:right"
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
</style>