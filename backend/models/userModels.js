import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    verifyotp : {type: String, default: ''},
    verifyotpexpiryat: {type: Number, default:0},
    isVerified : {type: Boolean, default: false},
    resetotp : {type: String, default: ''},
    resetotpexpiryat: {type: Number, default:0},
    createdAt: {type: Date, default: Date.now}
})

const userModel=mongoose.model.user || mongoose.model('user', userSchema);

export default userModel;