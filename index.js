// require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const path=require('path')
// require('./db/conn');


app.use(cors())
app.use(express.json({ limit: "10mb" }))




const PORT = process.env.PORT || 8080
let receivedData = null; // Store received data globally

app.get('/', (req, res)=>{
    res.send("Welcome");
})

app.post('/api/data', async (req, res) => {
    try {
        console.log("Received data from Arduino:", req.body);

        if (!req.body || !req.body.potentiometer_value || !req.body.pwm_value) {
            return res.status(400).send({ message: "Invalid data received", success: false });
        }

        receivedData = { // Store data globally
            potentiometer_value: req.body.potentiometer_value,
            pwm_value: req.body.pwm_value,
            potentiometer_voltage: req.body.potentiometer_voltage,
            motor_voltage: req.body.motor_voltage,
            base_voltage: req.body.base_voltage
        };

        console.log("Processed data:", receivedData);

        res.status(200).send({ message: "Data received successfully", success: true });
    } catch (error) {
        console.error("Error processing data from Arduino:", error);
        res.status(500).send({ message: "Internal server error", success: false });
    }
});


app.get('/api/data', (req, res) => {
    if (!receivedData) {
        return res.status(404).send({ message: "No data received yet", success: false });
    }

    res.status(200).json(receivedData);
});



app.listen(PORT, () => {
    console.log(`Server is running at port : ${PORT}`)
})