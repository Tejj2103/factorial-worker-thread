const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const  inquirer = require('inquirer');
const os = require('os');
const ora = require('ora');
const path = require('path'); 
const userCPUSCount  = os.cpus().length;

const workerPath = path.resolve('factorial.js')
const calculateFactorial = (number) => {

    if(number  === 0 ){
        return 0;
    }
    return  new Promise (async (parentResolve, parentReject)=>{
        const numbers  = [...new Array(number)].map((_,i)=> i+1);

        const segmentSize  = Math.ceil(numbers.length/ userCPUSCount);
        const segments = [];

        console.log("numbers", numbers ,userCPUSCount);
        for (let segmentIndex = 0; segmentIndex < userCPUSCount; segmentIndex++){
            const start  = segmentIndex * segmentSize;
            const end =  start + segmentSize;
            const segment = numbers.slice(start, end);
            segments.push(segment);
        }
        console.log(segments);

        try {
            const results = await Promise.all(
                
            segments.map(
                
            segment => new Promise((resolve, reject)=> {

                const worker = new Worker(workerPath , {
                            workerData: segment
                        });
                        worker.on('message', resolve);
                        worker.on('error', reject);
                        worker.on('exit', (code) => {
                            if (code !== 0)
                            reject(new Error(`Worker stopped with exit code ${code}`));
                        });
                     })
                    )
                );
        const finalResult = results.reduce((acc, val)=> acc*val, 1);
        parentResolve(finalResult); 
        }
        catch (e){
            parentReject(e); 
         }
    });
};


const run = async() =>{
    const {inputNumber} = await inquirer
        .prompt([{
            type: 'number',
            name : 'inputNumber',
            message: 'Calculate factorial for :',
            // default: 10
        }])

    
    const spinner = ora('Calculating...').start();

    const result = await calculateFactorial(inputNumber);

    spinner.succeed (`Result: ${result}`);
}


run(); 