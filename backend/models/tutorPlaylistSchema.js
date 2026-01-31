const mongoose = require('mongoose');

const collaborators = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
  },
  profile:{
    type:String,
    required:false,
  }

})

const tutorPlaylist = new mongoose.Schema({
  post_ids:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Author.posts',
    required:true
  }],
  title:{
    type:String,
    required:true,
  },
   domain:{
    type:String,
    required:true,
  },
  name:{
    type:String,
    required:true,
  },
  thumbnail:{
    type:String,
    required:false,
  },
  email:{
    type:String,
    required:true,

  },
  profile:{
    type:String,
    required:false,
  } ,
  collaborators:{ 
    type:[collaborators],
    default:[]
  }
})

const TutorPlayList = mongoose.model('TutorPlayList', tutorPlaylist);

module.exports = TutorPlayList;