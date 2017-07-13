//connect with welinktalent local database
var db = connect('127.0.0.1:27017/welinktalent');

//create the dummy admin collection with email: welinktalent@gmail.com and password: welinktalent
var dummyUser = db.user.findOneAndUpdate({
		"email": "welinktalent@gmail.com"
	},
	{
		$set: {
			"email": "welinktalent@gmail.com",
			"bookmark_ids": [],
			"createdAt": new Date(),
			"updatedAt": new Date(),
			"role": "admin",
			"password": "$2a$10$DPt1LS4WUYolxiWTASvmb.H/2gKqkpYcejW2qDc/BQQHMPWCabXVy"
		}
	},
	{
		"upsert": true,
		"returnNewDocument": true
	});

print("**********User collection updated with dummy admin user**********");
print("**********Creating admin profile**********");

//create dummy admin profile and update user id into it
var dummyUserProfile = db.profile.findOneAndUpdate({
		"user": dummyUser._id
	},
	{
		$set: {
			"linkedinId": "H6FFusJ2T4",
			"emailAddress": "welinktalent@gmail.com",
			"firstName": "weLinkTalent",
			"lastName": "weLinkTalent",
			"pictureUrl": "https://media.licdn.com/mpr/mprx/0_15IglPXtAvv7vPx_sqAPxTYtN5X7rC8C1TxgcblPl5EavtYxyqxPsXWP9Gdy9-OasqxjVvQ1j_emPQnt09aTMbb0Z_efPQV7s9aYtQt-PCg_MK319bZr--yi49t0VQSY1vElz4DWQrN",
			"positions": [
				{
					"company": {
						"id": 22294,
						"industry": "Information Technology & Services",
						"name": "VISEO",
						"size": "1001-5000",
						"type": "Privately Held"
					},
					"id": 1029277922,
					"isCurrent": true,
					"location": {},
					"title": "Full Stack Developer"
				}
			],
			"user": dummyUser._id,
			"skills": [],
			"createdAt": new Date(),
			"updatedAt": new Date()
		}
	},
	{
		"upsert": true,
		"returnNewDocument": true
});

print("**********Admin profile successfully created**********");

//update dummy admin user and add add profile id
db.user.update({
	"email": "welinktalent@gmail.com"
	},
	{
		"$set": {"profile": dummyUserProfile._id}
});

print("**********Admin successfully created**********");
