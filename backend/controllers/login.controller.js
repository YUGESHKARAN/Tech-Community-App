const Author  = require('../models/blogAuthorSchema') ;
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

const verifyUser =  async (req,res) => {

    try{

        const {email, password} = req.body ;
        const user = await Author.findOne({ email: { $eq: email }});

        if(!user){
          return  res.status(400).json({message:"Invalid Email"}) ;
        }
        
        const isMatch = await user.comparePassword(password) ;
        
        if(!isMatch){
           return res.status(400).json({message:"Invalid Password"}) ;
        }

        const payload = {
          authorname:user.authorname,
          email:user.email,
          role:user.role,
          profile:user.profile
        }

        // const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, { expiresIn: '1h' })
        const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, {expiresIn:"1d"})
        // const token = null
        res.status(200).json({message:"Login Successfull",token,author:payload}) ;

    }
    catch(err){

    //  res.send("Error" + err) ;
    res.status(500).json({message:"Server Error"})

    }
}

module.exports = {verifyUser}