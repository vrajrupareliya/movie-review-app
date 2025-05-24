//import express from express;
import connectdb from "./src/DB.js";
import dotenv from 'dotenv';
import {app} from './app.js';

dotenv.config({
        path: './.env'

})

connectdb()

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("mongodb conncetion error !!!", err);
})


















/*
const app = express();
app.get('/', (req, res) =>{
    res.send('server is ready');

})


const PORT = process.env.PORT|| 5000;

app.listen(PORT , () => {
    console.log(`server at http://localhost:${PORT}`);
});
*/