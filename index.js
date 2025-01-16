// const express = require('express');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(express.json({ limit: "10mb" }));

// const PORT = process.env.PORT || 8080;
// let receivedData = null; // Store received data globally

// app.get('/', (req, res) => {
//     res.send("Welcome");
// });

// // Endpoint to handle POST requests from Arduino (receiving data)
// app.post('/api/data', async (req, res) => {
//     try {
//         if (!req.body || !req.body.potentiometer_value || !req.body.pwm_value) {
//             return res.status(400).send({ message: "Invalid data received", success: false });
//         }

//         // Store the data globally
//         receivedData = {
//             potentiometer_value: req.body.potentiometer_value,
//             pwm_value: req.body.pwm_value,
//             potentiometer_voltage: req.body.potentiometer_voltage,
//             motor_voltage: req.body.motor_voltage,
//             base_voltage: req.body.base_voltage,
//         };

//         res.status(200).send({ message: "Data received successfully", success: true });
//     } catch (error) {
//         console.error("Error processing data from Arduino:", error);
//         res.status(500).send({ message: "Internal server error", success: false });
//     }
// });

// // Endpoint to provide data to client via SSE
// app.get('/api/data', (req, res) => {
//     if (!receivedData) {
//         return res.status(404).send({ message: "No data received yet", success: false });
//     }

//     // Set headers for SSE
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     // Send initial structure with placeholder values
//     res.write(`data: {
//   "potentiometer_value": ${receivedData.potentiometer_value},
//   "pwm_value": ${receivedData.pwm_value},
//   "potentiometer_voltage": ${receivedData.potentiometer_voltage},
//   "motor_voltage": ${receivedData.motor_voltage},
//   "base_voltage": ${receivedData.base_voltage}
// }\n\n`);

//     // Function to send only numeric value changes
//     const sendData = () => {
//         res.write(`data: {
//   "potentiometer_value": ${receivedData.potentiometer_value},
//   "pwm_value": ${receivedData.pwm_value},
//   "potentiometer_voltage": ${receivedData.potentiometer_voltage},
//   "motor_voltage": ${receivedData.motor_voltage},
//   "base_voltage": ${receivedData.base_voltage}
// }\n\n`);
//     };

//     // Send updated values every second
//     const interval = setInterval(sendData, 1000);

//     // Cleanup when client disconnects
//     req.on('close', () => {
//         clearInterval(interval);
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running at port : ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;
let receivedData = {
    potentiometer_value: 0,
    pwm_value: 0,
    potentiometer_voltage: 0,
    motor_voltage: 0,
    base_voltage: 0,
}; // Initial dummy data

// Endpoint to receive POST data
app.post('/api/data', (req, res) => {
    if (req.body) {
        receivedData = {
            potentiometer_value: req.body.potentiometer_value || 0,
            pwm_value: req.body.pwm_value || 0,
            potentiometer_voltage: req.body.potentiometer_voltage || 0,
            motor_voltage: req.body.motor_voltage || 0,
            base_voltage: req.body.base_voltage || 0,
        };
        res.status(200).send({ message: "Data received successfully", success: true });
    } else {
        res.status(400).send({ message: "Invalid data", success: false });
    }
});

// Endpoint to serve data to the browser via SSE
app.get('/api/data', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendData = () => {
        res.write(`data: ${JSON.stringify(receivedData, null, 2)}\n\n`);
    };

    // Send data initially
    sendData();

    // Send updated data every second
    const interval = setInterval(() => {
        sendData();
    }, 1000);

    // Clean up if the connection is closed
    req.on('close', () => {
        clearInterval(interval);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
