import bcrypt from 'bcrypt';
import userModel from '../models/userModels.js';
import Jwt from 'jsonwebtoken';
import transporter from '../nodemail.js';

// Register a new user

export const register=async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
      return res.status(400).json({sucess:false,message:"Please fill all the fields"});
    }
    try{
      const userExists=await userModel.findOne({email});
      if(userExists){
        return res.status(400).json({sucess:false,message:"User already exists"});
      }
      const hashedPassword=await bcrypt.hash(password,10);
      const user=new userModel({name,email,password:hashedPassword});
      await user.save();
      const token= Jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
      res.cookie('token',token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production'?'none':'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000});

        const emailverify={
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: 'Welcome to Personal Savings Goal Tracker',
          text: `Welcome to Personal Savings Goal Tracker.Your account has been created with email id:${email}.`,
        }
        await transporter.sendMail(emailverify);
        return res.status(201).json({sucess:true,message:"User registered successfully"});
        }catch(error){
        return res.status(500).json({sucess:false,message:error.message});
        }

  }


  // Login a user

  export const login =async(req,res)=>{
      const {email,password}=req.body;
      if(!email || !password){
        return res.status(400).json({sucess:false,message:"Please fill all the fields"});
      }
      try{
        const user=await userModel.findOne({email});
        if(!user){
          return res.status(400).json({sucess:false,message:"User does not exist"});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
          return res.status(400).json({sucess:false,message:"Invalid password"});
        }
        const token= Jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token', token, {
          httpOnly: false, // allow frontend JS to read cookie
          secure: false,   // set to true if using HTTPS
          sameSite: 'lax', // allow cross-site for dev
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({sucess:true,message:"User logged in successfully"});
      }catch(error){
        return res.status(500).json({sucess:false,message:error.message});
      }
    }
     
    // Logout a user

  export const logout = async (req, res) => {
      try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.status(200).json({ sucess: true, message: "User logged out successfully" }); 
    } catch (error) {
        return res.status(500).json({ sucess: false, message: error.message });
    }
  }

  // send verification OTP to user email

  export const sendverifyotp = async (req, res) => {
  try {
    const { userId } = req.body; 
    const user = await userModel.findById(userId); // ✅ Corrected
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0'); // ✅ 6-digit OTP
    user.verifyotp = otp;
    user.verifyotpexpiryat = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
    await user.save();
    const mailverify = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify your email for Personal Savings Goal Tracker',
      text: `Your OTP for verification is ${otp}. It is valid for 24 hours.`,
    };
    await transporter.sendMail(mailverify);
    return res.status(200).json({ success: true, message: "OTP sent to your email"});

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Verify user email with OTP

  export const verifyemail = async (req, res) => {
    try {
      const { userId, otp } = req.body;
      if (!userId || !otp) {
        return res.status(400).json({ sucess: false, message: "Please provide user ID and OTP" });
      }
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ sucess: false, message: "User not found" });
      }
      if (user.verifyotp === '' || user.verifyotp!==otp) {
        return res.status(400).json({ sucess: false, message: "Invalid or expired OTP" });
      }
      if(user.verifyotpexpiryat < Date.now()){
        return res.status(400).json({ sucess: false, message: "OTP has expired" });
      }
      user.isVerified = true;
      user.verifyotp = '';
      user.verifyotpexpiryat = 0;
      await user.save();
      return res.status(200).json({ sucess: true, message: "User verified successfully" });
    } catch (error) {
      return res.status(500).json({ sucess: false, message: error.message });
    }
  }


  // Check if user is authenticated

  export const isAuthenticated=async(req,res)=>{
      try{
          return res.json({sucess:true});
      }catch(error){
        return res.status(500).json({sucess:false,message:error.message});
      }
  }


// Send reset password OTP to user email

export const restotp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Please provide email" });
  }
  try {
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0'); // 6-digit OTP
    user.resetotp = otp;  // corrected key name
    user.resetotpexpiryat = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours validity
    await user.save();
    const mailverify = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP for Personal Savings Goal Tracker',
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password. It is valid for 24 hours.`,
    };
    await transporter.sendMail(mailverify);
    return res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//reset your password

export const resetpassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, OTP and new password",
    });
  }
  try {
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.resetotp || user.resetotp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    if (user.resetotpexpiryat < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetotp = '';
    user.resetotpexpiryat = 0;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};