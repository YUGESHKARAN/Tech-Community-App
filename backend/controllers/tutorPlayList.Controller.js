const { v4: uuidv4 } = require("uuid");
const TutorPlayList = require("../models/tutorPlaylistSchema");
const Author = require("../models/blogAuthorSchema");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const getAllTutorPlaylist = async (req, res) => {
  try {
    const tutorPlaylist = await TutorPlayList.find({ });
    if (tutorPlaylist?.length == 0) {
      return res.status(404).json({ message: "Playlist is empty" });
    }

    res.status(200).json({message:"all users playlist", data: tutorPlaylist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlaylistByEmail = async (req, res) => {
  try {
    const { email } = req.params;
//     await Author.updateMany(
//   { "posts.messages": { $exists: false } },
//   { $set: { "posts.$[].messages": [] } }
// );

    const tutorPlayList = await TutorPlayList.find({ email });

    if (!tutorPlayList || tutorPlayList.length == 0) {
      return res.status(204).json({ message: "Playlist is empty" });
    }

    res.status(200).json({message:"individual user playlist", data: tutorPlayList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlaylistById = async(req,res)=>{

  try{

    const {playlistId} = req.params
    const playList = await TutorPlayList.findOne({_id:playlistId})
    const email = playList.email;
    const domain = playList.domain;

    const author = await Author.findOne({email});

    const playlistPostIds = (playList.post_ids || []).map(id=> id.toString());
    
    // build a map of author's posts (filtered by domain) for O(1) lookup
    const postsById = {};
    (author.posts || []).forEach(post => {
      if (post.category === domain) {
        postsById[String(post._id)] = post;
      }
    });

    // preserve order from playList.post_ids
    const posts = playlistPostIds.map(id => postsById[id]).filter(Boolean);
    
    res.status(200).json({data:playList, posts:posts})

  }
  catch(err){
    res.status(500).json({message:err.message})
  }
}

const addTutorPlayList = async (req, res) => {
  try {
    let { postIds, title, domain, email, collaboratorsEmail } = req.body;
    // console.log(req.body);
    if (postIds.length < 1 || !title || !domain || !email) {
      return res.status(400).json({ message: "playlist data required" });
    }

    const user = await Author.findOne({ email});
    // console.log("user",user);

    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const profile = user.profile;
    const name = user.authorname;

    const collaborators = [];

    collaboratorsEmail = Array.isArray(collaboratorsEmail)
    ? collaboratorsEmail
    : [collaboratorsEmail];

    if (collaboratorsEmail && collaboratorsEmail.length > 0) {
      for (const collabEmail of collaboratorsEmail) {
        const normalizedCollabEmail = String(collabEmail).trim().toLowerCase();
        const collabUser = await Author.findOne({
          email: normalizedCollabEmail,
        });
        // if (!collabUser) {
        //   return res.status(404).json({
        //     message: `collaborator with email ${collabEmail} not found`,
        //   });
        // }
        if (collabUser) {
          collaborators.push({
            name: collabUser.authorname,
            email: collabUser.email,
            profile: collabUser.profile,
          });
        }
      }
    }

    const tutorPlaylistFolder = "TutorPlaylist/";

    const uniqueFilename = req.file
      ? `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`
      : "";

    if (req.file) {
  
      // S3 Integration
      const params = {
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
    }

    const tutorPlaylist = new TutorPlayList({
      post_ids: postIds,
      title,
      name,
      domain,
      thumbnail: req.file ? uniqueFilename : "",
      email,
      profile,
      collaborators: collaborators,
    });

    await tutorPlaylist.save();
    res
      .status(201)
      .json({ message: "Playlist created successfully", data: tutorPlaylist });
  } catch (err) {
    console.log("error",err.message)
    res.status(500).json({ message: err.message });
  }
};

const updateTutorPlayList = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("Updating playlist with id:", id);

    const { postIds, title, domain, collaboratorsEmail } = req.body;

    const playList = await TutorPlayList.findById(id);
    // console.log("Found playlist:", playList);

    if (playList===null) {

      return res.status(404).json({ message: "Playlist not found" });
    }


    if (title) {
      playList.title = title;
    }
    if (domain) {
      playList.domain = domain;
    }

     const tutorPlaylistFolder = "TutorPlaylist/";

    const uniqueFilename = req.file
      ? `${tutorPlaylistFolder}${uuidv4()}-${req.file.originalname}`
      : "";

    if (req.file) {
  
      // S3 Integration
      const params = {
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
    }

    if (req.file) {
      // Delete old thumbnail from S3 if it exists
      if (playList.thumbnail) {
        try {
          const deleteParams = {
            Bucket: bucketName,
            Key: playList.thumbnail,
          };
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          console.log("Deleting old thumbnail from S3:", playList.thumbnail);
          await s3.send(deleteCommand);
        } catch (err) {
          console.log("Error deleting old thumbnail from S3:", err);
        }
      }

      // Update to new thumbnail
      playList.thumbnail = uniqueFilename;
    }


    const collaborators = [];

 // Normalize collaboratorsEmail to an array (handles single string input)
    let collaboratorsEmailsArr = collaboratorsEmail;
    if (collaboratorsEmailsArr && !Array.isArray(collaboratorsEmailsArr)) {
      collaboratorsEmailsArr = [collaboratorsEmailsArr];
    }

    if (collaboratorsEmailsArr && collaboratorsEmailsArr.length > 0) {
      for (const collabEmail of collaboratorsEmailsArr) {
        const normalizedCollabEmail = String(collabEmail).trim().toLowerCase();
        const collabUser = await Author.findOne({
          email: normalizedCollabEmail,
        });
        if (!collabUser) {
          return res.status(404).json({
            message: `collaborator with email ${collabEmail} not found`,
          });
        }
        collaborators.push({
          name: collabUser.authorname,
          email: collabUser.email,
          profile: collabUser.profile,
        });
      }
    }

    if (postIds !== undefined) playList.post_ids = postIds;


    // playList.post_ids = postIds;

    playList.collaborators = collaborators;

    await playList.save();
    res
      .status(200)
      .json({ message: "Playlist updated successfully", data: playList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deleteTutorPlayList = async(req,res)=>{
    try{

        const {id} = req.params;
        const tutorPlayListData = await TutorPlayList.findById(id);

        if(!tutorPlayListData){
            return res.status(404).json({message:"Playlist not found"});
        }

        if(tutorPlayListData.thumbnail){
            try{
                const deleteParams = {
                    Bucket: bucketName,
                    Key: tutorPlayListData.thumbnail,   
                };
                const deleteCommand = new DeleteObjectCommand(deleteParams);
                await s3.send(deleteCommand);
            }
            catch(err){
                console.log("Error deleting thumbnail from S3:", err);
            }
        }
        const tutorPlayList = await TutorPlayList.findByIdAndDelete(id);
        if(!tutorPlayList){
            return res.status(404).json({message:"Playlist not found"});
        }   
        res.status(200).json({message:"Playlist deleted successfully"});

    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}


const getBookmarkedPlaylists = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ message: "email required" });

    // adjust "postBookmark" to the actual field name on your Author schema if different
    const author = await Author.findOne({ email }).select("postBookmark");
    if (!author) return res.status(404).json({ message: "author not found" });

    const playlistIds = (author.postBookmark || [])
      .map((id) => (id ? id.toString() : null))
      .filter(Boolean);

    if (playlistIds.length === 0) {
      return res.status(200).json({ message: "No playlists", playlists: [] });
    }

    const playlists = await TutorPlayList.find({ _id: { $in: playlistIds } }).lean();

    const map = new Map(playlists.map((p) => [p._id.toString(), p]));
    const orderedPlaylists = playlistIds.map((id) => map.get(id)).filter(Boolean);

    return res.status(200).json({
      message: "Bookmarked playlists",
      count: orderedPlaylists.length,
      playlists: orderedPlaylists,
      playlistIds: orderedPlaylists.map((p) => p._id.toString()),
    });
  } catch (err) {
    console.error("getBookmarkedPlaylists error:", err);
    return res.status(500).json({ message: "server error", error: err.message });
  }
};

module.exports = {
  addTutorPlayList,
  getAllTutorPlaylist,
  getPlaylistById,
  getPlaylistByEmail,
  updateTutorPlayList,
  deleteTutorPlayList,
  getBookmarkedPlaylists
};
