const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Message schema
const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: false,
  },
  profile:{
    type:String,
    required:false
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Post schema for blog posts
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false, // Image is optional
  },
  links: {
    type: [
      {
        title: { type: String, required: false }, // Title of the link
        url: { type: String, required: false },  // URL of the link
      },
    ],
    default: [],
    validate: {
      validator: function (v) {
        // Ensure all entries have unique URLs
        return Array.isArray(v) && new Set(v.map(link => link.url)).size === v.length;
      },
      message: "Links array must contain unique URLs",
    },
  },

  documents:{
    type:[String],
    default:[],
    required:false,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && new Set(v).size === v.length; // Ensure all entries are unique
      },
      message: "pdfs array must contain unique values",
    },
  },
  description: {
    type: String,
    required: true,
  },
  category:{
    type:String,
    required:true,
  },
  views:{
    type:[String],
    default:[],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && new Set(v).size === v.length; // Ensure all entries are unique
      },
      message: "Views array must contain unique values",
    },
  },
  likes:{
    type:[String],
    default:[],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && new Set(v).size === v.length; // Ensure all entries are unique
      },
      message: "Views array must contain unique values",
    },
  },
  // messages: [messageSchema], // Messages linked to the post
  messages: {
  type: [messageSchema],
  default: []
},
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
});


// notification schema
const notificationSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    profile:{
      type:String,
      required:false
    },
    url:{
      type:String,
      required:true
    },
    authorEmail: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
)

const announcementSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    links: {
      type: [
        {
          title: { type: String, required: false }, // Title of the link
          url: { type: String, required: false },  // URL of the link
        },
      ],
      default: [],
      validate: {
        validator: function (v) {
          // Ensure all entries have unique URLs
          return Array.isArray(v) && new Set(v.map(link => link.url)).size === v.length;
        },
        message: "Links array must contain unique URLs",
      },
    },

    poster:{
      type:String,
      required:false
    },
    
   deliveredTo:{
    type: String,
     enum: ['all',"community",'coordinators'],
     default: 'all'
   }, 

    message: {
      type: String,
      required: true,
    },
    profile:{
      type:String,
      required:false
    },
    authorEmail: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
      image:{
      type:String,
      required:false
    },
  }
)

// Author schema for storing authors and their posts
const authorSchema = new mongoose.Schema({
  authorname: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['student', 'coordinator', 'admin'],
    default: 'student'
  },
  community: {
    type: [String],
    default: []
  },

  announcement: [announcementSchema],
   // Store bookmarked post ids (unique ObjectIds referencing posts within authors' posts)
  postBookmark: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && new Set(v.map(id => id.toString())).size === v.length;
      },
      message: "postBookmark must contain unique post IDs"
    }
  },

  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [emailRegex, 'Please provide a valid email address'] // Ensure each email is unique
  },
  profile:{
    type: String,
    required: false, // Image is optional

  },
  followers:{
     type:[String],
     default:[]
  },
  following: {
    type: [String], // Emails of authors the user follows
    default: []
  },
  posts: [postSchema], // Array of posts linked to the author
  notification:[notificationSchema],
  
  personalLinks: {
    type: [
      {
        title: { type: String, required: false }, // Title of the link
        url: { type: String, required: false },   // URL of the link
      },
    ],
    default: [],
    validate: {
      validator: function (v) {
        // Ensure all entries have unique URLs and maximum count is 5
        const isUnique = Array.isArray(v) && new Set(v.map(link => link.url)).size === v.length;
        const isMaxFive = v.length <= 5;
        return isUnique && isMaxFive;
      },
      message: props => {
        const urls = props.value.map(link => link.url);
        const hasDuplicates = new Set(urls).size !== urls.length;
        if (hasDuplicates) {
          return "Links array must contain unique URLs.";
        }
        if (props.value.length > 5) {
          return "You can only add up to 5 links.";
        }
        return "Invalid personal links.";
      },
    },
  },
 
  otp: { type: String }, // OTP for password reset
  otpExpiresAt: { type: Date } // Expiry time for the OTP
});

// Password encryption before saving the author
authorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password is not modified

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with a factor of 10
    const hashPassword = await bcrypt.hash(this.password, salt); // Hash the password
    this.password = hashPassword; // Replace the plain password with the hashed one
    next();
  } catch (err) {
    next(new Error('Error hashing password: ' + err)); // Handle any errors during the hashing process
  }
});

// Method to compare passwords during login
authorSchema.methods.comparePassword =  function (enteredPassword) {
  return  bcrypt.compare(enteredPassword, this.password); // Compare entered password with the hashed one
};

// Author model
const Author = mongoose.model('Author', authorSchema);
module.exports = Author;



