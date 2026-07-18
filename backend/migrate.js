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






// const mongoose = require('mongoose');
// require('dotenv').config();
// const { Author, Post } = require('./models/blogAuthorSchema');
// const dns = require("dns");

// const Community = require('./models/communitySchema');
// const CommunityMembership = require('./models/communityMembershipSchema');

// const MONGO_URI = process.env.MONGODB_URL ; 
// const DRY_RUN =false;
// const DEFAULT_TENANT_ID = 'dsu';

// const GLOBAL_COORDINATOR_ROLES = ['coordinator', 'admin', 'director'];

// function slugify(name) {
//   return name
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/(^-|-$)/g, '');
// }

// function tenantOf(author) {
//   return author.tenantId || DEFAULT_TENANT_ID;
// }

// async function run() {
//   if (process.env.NODE_ENV === "development") {
//     // dns.setServers(["8.8.8.8", "8.8.4.4"]);
//     const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,8.8.4.4")
//     .split(",")
//     .map((server) => server.trim())
//     .filter(Boolean);
  
//   if (dnsServers.length > 0) {
//     dns.setServers(dnsServers);
//   }
  
//   }
//   await mongoose.connect(MONGO_URI);
//   console.log(`Connected. DRY_RUN=${DRY_RUN} DEFAULT_TENANT_ID=${DEFAULT_TENANT_ID}`);

//   // ── Step 1: build per-tenant community name sets ──
//   // key: `${tenantId}::${slug}` -> { tenantId, slug, name }
//   const communityKeys = new Map();

//   const authors = await Author.find({}, '_id community role tenantId');
//   for (const author of authors) {
//     const tenantId = tenantOf(author);
//     for (const raw of author.community || []) {
//       if (!raw || typeof raw !== 'string') continue;
//       const name = raw.trim();
//       const slug = slugify(name);
//       const key = `${tenantId}::${slug}`;
//       if (!communityKeys.has(key)) communityKeys.set(key, { tenantId, slug, name });
//     }
//   }

//   // Posts don't carry tenantId directly — derive it via the author.
//   // (Once Post.tenantId is added going forward, this lookup won't be
//   // needed for new data, only for this historical backfill.)
//   const postTenantCategory = await Post.aggregate([
//     {
//       $lookup: {
//         from: Author.collection.name,
//         localField: 'authorId',
//         foreignField: '_id',
//         as: 'author',
//       },
//     },
//     { $unwind: '$author' },
//     {
//       $group: {
//         _id: {
//           tenantId: { $ifNull: ['$author.tenantId', DEFAULT_TENANT_ID] },
//           category: '$category',
//         },
//         postCount: { $sum: 1 },
//       },
//     },
//   ]);

//   for (const row of postTenantCategory) {
//     const { tenantId, category } = row._id;
//     if (!category) continue;
//     const name = category.trim();
//     const slug = slugify(name);
//     const key = `${tenantId}::${slug}`;
//     if (!communityKeys.has(key)) communityKeys.set(key, { tenantId, slug, name });
//   }

//   console.log(`Found ${communityKeys.size} distinct (tenant, community) pairs.`);

//   // ── Step 2: upsert Community docs, track communityId per key ──
//   const communityIdByKey = {};
//   for (const [key, { tenantId, slug, name }] of communityKeys.entries()) {
//     if (DRY_RUN) {
//       console.log(`[dry-run] would upsert Community: tenant=${tenantId} name=${name}`);
//       communityIdByKey[key] = key; // placeholder — no real ObjectId exists yet, just needs to be truthy
//       continue;
//     }
//     const doc = await Community.findOneAndUpdate(
//       { tenantId, slug },
//       { $setOnInsert: { tenantId, name, slug } },
//       { upsert: true, new: true }
//     );
//     communityIdByKey[key] = doc._id;
//   }

  

//   // ── Step 3: backfill CommunityMembership, scoped per tenant ──
//   let membershipsCreated = 0;

//   for (const author of authors) {
//     const tenantId = tenantOf(author);
//     // Rule, not a guess: global coordinator/admin/director roles are
//     // coordinators of every community they belong to.
//     const role = GLOBAL_COORDINATOR_ROLES.includes(author.role) ? 'coordinator' : 'member';

//     for (const rawCommunity of author.community || []) {
//       const slug = slugify(rawCommunity.trim());
//       const key = `${tenantId}::${slug}`;
//       const communityId = communityIdByKey[key];
//       if (!communityId) continue; // dry-run or lookup miss, skip safely

//       if (DRY_RUN) {
//         console.log(
//           `[dry-run] would upsert membership: tenant=${tenantId} author=${author._id} community=${rawCommunity} role=${role}`
//         );
//         continue;
//       }

//       await CommunityMembership.findOneAndUpdate(
//         { tenantId, communityId, authorId: author._id },
//         { $setOnInsert: { tenantId, communityId, authorId: author._id, role } },
//         { upsert: true }
//       );
//       membershipsCreated++;
//     }
//   }

//   // ── Step 4: refresh cached counts, scoped per tenant ──
//   if (!DRY_RUN) {
//     const postCountByKey = {};
//     for (const row of postTenantCategory) {
//       const { tenantId, category } = row._id;
//       const slug = slugify((category || '').trim());
//       postCountByKey[`${tenantId}::${slug}`] = row.postCount;
//     }

//     for (const [key, communityId] of Object.entries(communityIdByKey)) {
//       const { tenantId } = communityKeys.get(key);
//       const memberCount = await CommunityMembership.countDocuments({ tenantId, communityId });
//       const postCount = postCountByKey[key] || 0;
//       await Community.updateOne({ _id: communityId }, { memberCount, postCount });
//     }
//   }

//   console.log('---');
//   console.log(`Communities upserted: ${communityKeys.size}`);
//   console.log(`Memberships upserted: ${membershipsCreated}`);
//   console.log(
//     `Legacy authors bucketed into DEFAULT_TENANT_ID ("${DEFAULT_TENANT_ID}"): ` +
//     `db.authors.countDocuments({ tenantId: { $in: [null, undefined] } })`
//   );

//   await mongoose.disconnect();
// }

// run().catch((err) => {
//   console.error('Migration failed:', err);
//   process.exit(1);
// });