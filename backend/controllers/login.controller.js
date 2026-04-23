const {Author}  = require('../models/blogAuthorSchema') ;
const {DeletionLog} = require('../models/deletionLogSchema');
const bcrypt = require('bcrypt') ; 
require('dotenv').config();

const jwt = require('jsonwebtoken');

// const verifyUser =  async (req,res) => {

//     try{

//         const {email, password} = req.body ;
//         const author = await Author.findOne({ email: { $eq: email }});

//         if(!author){
//           return  res.status(400).json({message:"Invalid Email"}) ;
//         }
        
//         const isMatch = await author.comparePassword(password) ;
        
//         if(!isMatch){
//            return res.status(400).json({message:"Invalid Password"}) ;
//         }

//         res.status(200).json({message:"Login Successfull",author}) ;

//     }
//     catch(err){

//      res.send("Error" + err) ;

//     }
// }

// const verifyUser =  async (req,res) => {
//         console.log("verify user called")
//     try{

//         const {email, password} = req.body ;
//         const user = await Author.findOne({ email: { $eq: email }});

//         if(!user){
//           return  res.status(400).json({message:"Invalid Email"}) ;
//         }
        
//         const isMatch = await user.comparePassword(password) ;
        
//         if(!isMatch){
//            return res.status(400).json({message:"Invalid Password"}) ;
//         }

//         const payload = {
//           authorname:user.authorname,
//           email:user.email,
//           role:user.role,
//           profile:user.profile
//         }

//         // const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, { expiresIn: '1h' })
//         const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, {expiresIn:"1d"})
//         // const token = null
//         res.status(200).json({message:"Login Successfull",token,author:payload}) ;

//     }
//     catch(err){

//     //  res.send("Error" + err) ;
//     console.log("error", err.message)
//     res.status(500).json({message:"Server Error"})

//     }
// }

const verifyUser = async (req, res) => {
  console.log("verify user called");
  try {
    const { email, password } = req.body;

    const user = await Author.findOne({ email: { $eq: email } })
      .select('password authorname email role profile');

    if (!user) {
      // fix: check deletion log before returning generic "Invalid Email"
      const deletionRecord = await DeletionLog.findOne({
        'snapshot.author.email': { $eq: email },
        status: 'deleted',
      }).select('_id deletionType').lean();

      console.log("deletionRecord:", deletionRecord);
    
      
      if (deletionRecord) {
       let message = "This account has been deleted. Contact admin to restore your account";
       
        if(deletionRecord.deletionType === "admin_action"){
          message = "This account has been deleted by admin. Contact admin to restore your account."
        }
        else{
          message = "This account has been self deleted. Contact admin to restore your account."
        }

      return res.status(403).json({
          message: message,
          canRestore: true,
          deletionType: deletionRecord.deletionType,
        });
      }

      return res.status(400).json({ message: "Invalid Email" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const payload = {
      authorname: user.authorname,
      email:      user.email,
      role:       user.role,
      profile:    user.profile,
    };

    const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, { expiresIn: "1d" });

    res.status(200).json({ message: "Login Successfull", token, author: payload });
  } catch (err) {
    console.error("verifyUser error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {verifyUser}