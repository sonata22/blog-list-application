const mongoose = require('mongoose')
//const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minLength: 3,
        required: [true, 'Username is mandatory.'],
        unique: true,
    },
    name: String,
    passwordHash: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId, // for populate to work
            ref: 'Blog'
        }
    ],

})

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User
