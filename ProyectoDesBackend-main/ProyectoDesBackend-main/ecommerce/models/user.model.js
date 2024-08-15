const mongoose = require('mongoose');

const userCollection = "usuarios";

const userSchema = new mongoose.Schema({
    nombre: {type: 'string',required: true, max:100},
    apellido: {type: 'string', required: true, max:50},
    email: {type: 'string', required: true, max:20}
})

const userModel = mongoose.model(userCollection, userSchema)

module.exports = {userModel}