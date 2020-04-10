const {    Worker, parentPort, workerData  } = require('worker_threads');

//get the array numbers
const numbers = workerData;
const calculateFactorial = numArray => numArray.reduce((acc, val)=> acc*val,1);

const result  = calculateFactorial(numbers);

//return result
parentPort.postMessage(result);
