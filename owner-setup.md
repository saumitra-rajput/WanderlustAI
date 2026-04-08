## 👤 First-Time Setup — Link Listings to a User

Before you can view listing detail pages or use AI Travel Tips, all listings must be linked to an owner account.

### Step 1 — Create an account

Visit `http://localhost:8080/signup` and create a user account.

---

### Step 2 — Get your User ID

Run this command to find the ID of the user you just created:

```bash
docker exec -it wanderlust-mongo mongosh wanderlust --eval \
  "db.users.find({}, {username:1, _id:1})"
```

You'll see output like:

```
{ _id: ObjectId('abc123...'), username: 'yourname' }
```

Copy the `ObjectId` value.

---

### Step 3 — Link all listings to your user

Replace `PASTE_ID_HERE` with the ID you copied above:

```bash
docker exec -it wanderlust-mongo mongosh wanderlust --eval "
db.listings.updateMany({}, { \$set: { owner: ObjectId('PASTE_ID_HERE') } })
"
```

---

### Step 4 — You're all set!

Visit `http://localhost:8080/listings`, click any listing, and you'll see:
- The listing detail page loading without errors
- The **✨ Get AI Travel Tips** button ready to use

> **Note:** This step is only needed once. New listings created while logged in are automatically linked to your account.
