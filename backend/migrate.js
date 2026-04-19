// // migrate.js — run this ONCE with: node migrate.js
// require('dotenv').config();
// const mongoose = require('mongoose');
// const { Author, Post } = require('./models/blogAuthorSchema');

// async function migrate() {
//   await mongoose.connect(process.env.MONGDB_URL);
//   console.log('Connected to database');

//   const authors = await Author.find({}).lean();
//   console.log(`Found ${authors.length} authors to process`);

//   let totalPostsMigrated = 0;
//   let authorsSkipped = 0;

//   for (const author of authors) {
//     // skip authors who already have ObjectId refs (already migrated)
//     const alreadyMigrated = author.posts?.length > 0 &&
//       author.posts.every(p => mongoose.Types.ObjectId.isValid(p) && typeof p !== 'object');

//     if (alreadyMigrated) {
//       authorsSkipped++;
//       continue;
//     }

//     // skip authors with no posts
//     if (!author.posts || author.posts.length === 0) continue;

//     // build Post documents from embedded posts
//     const postDocs = author.posts.map(post => ({
//       ...post,
//       _id:      post._id || new mongoose.Types.ObjectId(),
//       authorId: author._id,
//     }));

//     // insert into Post collection
//     const inserted = await Post.insertMany(postDocs, { ordered: false });
//     const postIds  = inserted.map(p => p._id);

//     // replace embedded posts array with ObjectId refs
//     await Author.updateOne(
//       { _id: author._id },
//       { $set: { posts: postIds } }
//     );

//     totalPostsMigrated += postIds.length;
//     console.log(`✓ ${author.email} — ${postIds.length} posts migrated`);
//   }

//   console.log('─────────────────────────────────');
//   console.log(`Migration complete`);
//   console.log(`Total posts migrated: ${totalPostsMigrated}`);
//   console.log(`Authors skipped (already migrated or no posts): ${authorsSkipped}`);

//   await mongoose.disconnect();
// }

// migrate().catch(err => {
//   console.error('Migration failed:', err);
//   process.exit(1);
// });