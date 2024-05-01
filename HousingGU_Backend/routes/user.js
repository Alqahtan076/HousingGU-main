const express = require("express");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const user = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads/profilePictures");
	},
	filename: (req, file, cb) => {
		const originalname = `${uuidv4()}.jpg`;
		cb(null, originalname);
	},
});
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
		}
	},
});
user.post("/user/addPreferences", async (req, res) => {
	try {
		const { genderPreference, bedtime, tidiness, smoking, willingToLiveWithSmoker, freeTime, friendsVisit, petsComfortable, petPreferences, noiseLevel, cookingFrequency, sharingBelongings, overnightGuests, cleaningDuties, workSchedule, spaceUsage, hobbies, privacyExpectation, allergies, longTermPlans, billSplit, conflictResolution } = req.body;

		// Check for empty string values
		if (!genderPreference || !bedtime || !tidiness || !smoking || !willingToLiveWithSmoker || !freeTime || !friendsVisit || !petsComfortable || !petPreferences.comfortable || !petPreferences.owned || !noiseLevel || !cookingFrequency || !sharingBelongings || !overnightGuests || !cleaningDuties || !workSchedule || !spaceUsage || !hobbies || !privacyExpectation || !allergies.value || !longTermPlans || !billSplit || !conflictResolution) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		// Check if the user already has a preference
		const existingPreference = await prisma.preference.findUnique({
			where: {
				userId: req.user.id,
			},
		});

		if (existingPreference) {
			// If the user already has a preference, update it
			const updatedPreference = await prisma.preference.update({
				where: {
					id: existingPreference.id,
				},
				data: {
					genderPreference,
					bedtime,
					tidiness,
					smoking,
					willingToLiveWithSmoker,
					freeTime,
					friendsVisit,
					petsComfortable,
					comfortable: petPreferences.comfortable,
					owned: petPreferences.owned,
					ownedPetsDescription: petPreferences.ownedPetsDescription,
					noiseLevel,
					cookingFrequency,
					sharingBelongings,
					overnightGuests,
					cleaningDuties,
					workSchedule,
					spaceUsage,
					hobbies,
					privacyExpectation,
					allergiesValue: allergies.value,
					allergiesDescription: allergies.description,
					longTermPlans,
					billSplit,
					conflictResolution,
				},
			});
			res.status(200).json({ message: "Preference updated successfully", preference: updatedPreference });
		} else {
			// If the user doesn't have a preference, create a new one
			const preference = await prisma.preference.create({
				data: {
					genderPreference,
					bedtime,
					tidiness,
					smoking,
					willingToLiveWithSmoker,
					freeTime,
					friendsVisit,
					petsComfortable,
					comfortable: petPreferences.comfortable,
					owned: petPreferences.owned,
					ownedPetsDescription: petPreferences.ownedPetsDescription,
					noiseLevel,
					cookingFrequency,
					sharingBelongings,
					overnightGuests,
					cleaningDuties,
					workSchedule,
					spaceUsage,
					hobbies,
					privacyExpectation,
					allergiesValue: allergies.value,
					allergiesDescription: allergies.description,
					longTermPlans,
					billSplit,
					conflictResolution,
					userId: req.user.id,
				},
			});

			const updateUser = await prisma.user.update({
				where: {
					id: req.user.id,
				},
				data: {
					PreferenceFilled: true,
				},
			});

			res.status(201).json({ message: "Preference created successfully", preference });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

user.get("/user/profile/:id", async (req, res) => {
	try {
		const Id = req.params.id;
		const getUser = await prisma.user.findUnique({
			where: {
				id: Id,
			},
		});
		res.status(200).send({ user: getUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});
user.get("/user/myprofile/:id", async (req, res) => {
	try {
		const Id = req.params.id;
		const getUser = await prisma.user.findUnique({
			where: {
				id: Id,
			},
			select: {
				id: true,
				username: true,
				email: true,
				aboutMe: true,
				type: true,
				createdAt: true,
				updatedAt: true,
				phoneNumber: true,
				admin: true,
				profilePicture: true,
				PreferenceFilled: true,
				apartments: true,
				Preference: true,
				chats: true,
				messages: true,
				Matched: true,
				Notification: true,
				age: true,
				gender: true,
			},
		});

		const getChat = await prisma.matched.findMany({
			where: {
				OR: [{ MatchRequestedBy: Id }, { MatchRequestTo: Id }],
				ApprovedRequest: true,
			},
			include: {
				Chat: true,
				user: {
					select: {
						id: true,
						profilePicture: true,
						aboutMe: true,
						username: true,
						age: true,
						gender: true,
					},
				},
			},
		});

		for (let i = 0; i < getChat.length; i++) {
			const match = getChat[i];
			if (match.MatchRequestedBy === Id) {
				const MatchRequestTo = await prisma.user.findUnique({
					where: {
						id: match.MatchRequestTo,
					},
					select: {
						id: true,
						profilePicture: true,
						aboutMe: true,
						username: true,
						age: true,
					},
				});
				getChat[i].user.id = MatchRequestTo.id;
				getChat[i].user.profilePicture = MatchRequestTo.profilePicture;
				getChat[i].user.aboutMe = MatchRequestTo.aboutMe;
				getChat[i].user.username = MatchRequestTo.username;
				getChat[i].user.age = MatchRequestTo.age;
			}
		}

		// Return all the data including matchedUserDetails
		res.status(200).send({ user: getUser, chats: getChat });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

user.post("/user/editProfile", upload.single("photo"), async (req, res) => {
	const request = req.body;
	const { userName, aboutMe, age, gender } = request;

	// Check if the username already exists
	const existingUser = await prisma.user.findUnique({
		where: {
			username: userName,
		},
	});

	if (existingUser && existingUser.id !== req.user.id) {
		// If a user with the same username exists and it's not the current user, return an error
		if (req.file == undefined) {
			return res.status(400).send({ response: "error", errorMessage: "Username already exists" });
		} else {
			fs.unlink("./uploads/profilePictures/" + req.file.filename, (err) => {
				if (err) {
					console.error("Error deleting file:", err);
				}
			});
			return res.status(400).send({ response: "error", errorMessage: "Username already exists" });
		}
	}

	if (!userName || !aboutMe || !age || !gender) {
		if (req.file == undefined) {
			return res.status(400).send({ response: "error", errorMessage: "Username, About, age and gender are required fields" });
		} else {
			fs.unlink("./uploads/profilePictures/" + req.file.filename, (err) => {
				if (err) {
					console.error("Error deleting file:", err);
				}
			});
			return res.status(400).send({ response: "error", errorMessage: "Username, About  are required fields" });
		}
	}

	if (req.file == undefined) {
		const updateUser = await prisma.user.update({
			where: {
				id: req.user.id,
			},
			data: {
				username: userName,
				aboutMe: aboutMe,
			},
		});
		return res.status(200).json({ success: true, message: "account updated" });
	} else {
		const getUser = await prisma.user.findUnique({
			where: {
				id: req.user.id,
			},
		});

		fs.unlink("./uploads/profilePictures/" + getUser.profilePicture, (err) => {
			if (err) {
				console.error("Error deleting file:", err);
			}
		});

		const updateUser = await prisma.user.update({
			where: {
				id: req.user.id,
			},
			data: {
				username: userName,
				aboutMe: aboutMe,
				profilePicture: req.file.filename,
			},
		});
		return res.status(200).json({ success: true, message: "account updated" });
	}
});

user.get("/user/matchingUsers", async (req, res) => {
	try {
		//console.log(req.user.id);
		const matchingUsers = await getMatchingUsers(req.user.id);
		res.status(200).send({ matching: matchingUsers });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error when handling matching" });
	}
});
user.get("/user/getMatchRequests", async (req, res) => {
	try {
		//console.log(req.user.id);
		const requests = await prisma.matched.findMany({
			where: {
				MatchRequestTo: req.user.id,
				AND: [{ NOT: { ApprovedRequest: true } }, { NOT: { RejectedRequest: true } }],
			},
			include: {
				user: true,
			},
		});
		const mappedRequests = requests.map((request) => ({
			matchId: request.id,
			matchRequestTo: request.MatchRequestTo,
			name: request.user.username,
			description: request.user.aboutMe,
			age: request.user.age,
			gender: request.user.gender,
			image: request.user.profilePicture,
			matchPercentage: parseInt(request.RequestedByMatchPercentage),
		}));
		//console.log(mappedRequests);
		res.status(200).send({ matching: mappedRequests });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error when handling matching" });
	}
});

user.post("/user/matchWithUser", async (req, res) => {
	try {
		const { requesterId, requesteeId, requestedToUsername, requesteeMatchPercentage, matchBoolen } = req.body;
		let matched;
		if (matchBoolen) {
			matched = await prisma.matched.create({
				data: {
					MatchRequestedBy: requesterId,
					RequestedByName: req.user.username,
					RequestedByMatchPercentage: JSON.stringify(requesteeMatchPercentage),
					MatchRequestTo: requesteeId,
					ApprovedRequest: false, //approval will come from other users in profile page
					RejectedRequest: false,
					RequestedToName: requestedToUsername,
				},
			});
			await createNotification("Request Received", "You have a request pending from  " + matched.RequestedByName, matched.MatchRequestTo);
		} else {
			matched = await prisma.matched.create({
				data: {
					MatchRequestedBy: requesterId,
					RequestedByName: req.user.username,
					RequestedByMatchPercentage: JSON.stringify(requesteeMatchPercentage),
					MatchRequestTo: requesteeId,
					ApprovedRequest: false,
					RejectedRequest: true,
				},
			});
		}

		res.status(201).json({ matched });
	} catch (error) {
		console.error("Error creating matched and chat:", error);
		res.status(500).json({ error: "Error creating matched and chat" });
	}
});

user.post("/user/acceptMatchRequest", async (req, res) => {
	try {
		const request = req.body;
		if (req.user.id == request.matchRequestTo) {
			const match = await prisma.matched.update({
				where: {
					id: request.matchId,
				},
				data: {
					ApprovedRequest: true,
				},
			});

			// Create a new chat
			const chat = await prisma.chat.create({
				data: {
					MatchedId: match.id,
					name: `Chat between ${match.RequestedByName} and ${match.RequestedToName}`,
					users: {
						connect: [{ id: match.MatchRequestedBy }, { id: match.MatchRequestTo }],
					},
				},
			});
			await createNotification("Request Accepeted", "You'r request have been accepeted by " + match.RequestedToName, match.MatchRequestedBy);
			res.status(201).json({ success: true, message: request.name + " have been added as a friend" });
		} else {
			res.status(201).json({ success: false, message: request.name + " not authorized to add this friend!" });
		}
	} catch (error) {
		console.error("Error accepting user match", error);
		res.status(500).json({ error: "Error creating matched and chat" });
	}
});

user.post("/user/rejectMatchRequest", async (req, res) => {
	try {
		const request = req.body;
		if (req.user.id == request.matchRequestTo) {
			const match = await prisma.matched.update({
				where: {
					id: request.matchId,
				},
				data: {
					RejectedRequest: true,
					ApprovedRequest: false,
				},
			});
			await createNotification("Request Rejected", "You'r request have been rejected by " + match.RequestedToName, match.MatchRequestedBy);
			res.status(201).json({ success: true, message: request.name + " have been ignored" });
		} else {
			res.status(201).json({ success: false, message: request.name + " not authorized to ignore!" });
		}
	} catch (error) {
		console.error("Error accepting user match", error);
		res.status(500).json({ error: "Error creating matched and chat" });
	}
});

user.post("/user/removeFriend", async (req, res) => {
	try {
		const request = req.body;
		const match = await prisma.matched.update({
			where: {
				id: request.id,
			},
			data: {
				RejectedRequest: true,
				ApprovedRequest: false,
			},
		});
		res.status(201).json({ success: true, message: request.RequestedToName + " have been removed" });
	} catch (error) {
		console.error("Error accepting user match", error);
		res.status(500).json({ error: "Error creating matched and chat" });
	}
});

user.get("/user/getNotifications", async (req, res) => {
	try {
		const getNotifications = await prisma.notification.findMany({
			where: {
				userId: req.user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		res.status(201).json({ success: true, notifications: getNotifications });
	} catch (error) {
		console.error("Error getting Notifications  ", error);
		res.status(500).json({ error: "Error getting Notifications" });
	}
});

async function getMatchingUsers(userId) {
	try {
		const userPreference = await prisma.preference.findUnique({
			where: {
				userId,
			},
		});
		const allUsers = await prisma.user.findMany({
			where: {
				id: {
					not: userId,
				},
				PreferenceFilled: true,
			},
			include: {
				Preference: true,
			},
		});
		const matchedEntries = await prisma.matched.findMany({
			where: {
				OR: [{ MatchRequestedBy: userId }, { MatchRequestTo: userId }],
			},
		});
		const matchingUsers = await Promise.all(
			allUsers.map(async (user) => {
				const matchingPercentage = await calculateMatchingPercentage(userPreference, user.Preference);
				const isMatched = matchedEntries.some((matched) => {
					return matched.MatchRequestedBy === user.id || matched.MatchRequestTo === user.id;
				});
				if (!isMatched) {
					return { id: user.id, username: user.username, aboutMe: user.aboutMe, age: user.age, gender: user.gender, profilePicture: user.profilePicture, matchPercentage: matchingPercentage };
				}
				return null;
			})
		);
		return matchingUsers.filter(Boolean).sort((a, b) => b.matchPercentage - a.matchPercentage);
	} catch (error) {
		console.error("Error getting matching users:", error);
		throw error;
	}
}

user.get("/user/getPreferences", async (req, res) => {
	try {
		const userPreference = await prisma.preference.findUnique({
			where: {
				userId: req.user.id,
			},
		});
		if (userPreference) {
			return res.status(200).json({
				success: true,
				preferences: userPreference,
			});
		} else {
			return res.status(404).json({
				success: false,
				message: "Preference not found",
			});
		}
	} catch (error) {
		console.error("Error getting user preferences:", error);
		return res.status(500).json({
			success: false,
			message: "Error getting user preferences",
		});
	}
});
user.get("/user/getPreferences/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;
		const userPreference = await prisma.preference.findUnique({
			where: {
				userId: userId,
			},
		});
		if (userPreference) {
			return res.status(200).json({
				success: true,
				preferences: userPreference,
			});
		} else {
			return res.status(404).json({
				success: false,
				message: "Preference not found",
			});
		}
	} catch (error) {
		console.error("Error getting user preferences:", error);
		return res.status(500).json({
			success: false,
			message: "Error getting user preferences",
		});
	}
});

user.post("/notificationSeen", async (req, res) => {
	try {
		const { userId } = req.body;
		const updatedNotifications = await prisma.notification.updateMany({
			where: {
				userId,
				seen: false, // Only update unseen notifications
			},
			data: {
				seen: true,
			},
		});
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error marking notifications as seen:", error);
		res.status(500).json({ error: "Failed to mark notifications as seen" });
	}
});
function calculateMatchingPercentage(userPreference, otherUserPreference) {
	const preferenceFields = ["genderPreference", "bedtime", "tidiness", "smoking", "willingToLiveWithSmoker", "freeTime", "friendsVisit", "petsComfortable", "comfortable", "owned", "noiseLevel", "cookingFrequency", "sharingBelongings", "overnightGuests", "cleaningDuties", "workSchedule", "spaceUsage", "hobbies", "privacyExpectation", "allergiesValue", "longTermPlans", "billSplit", "conflictResolution"];
	return preferenceFields.reduce((matchingPercentage, field) => {
		if (userPreference[field].toLowerCase() === otherUserPreference[field].toLowerCase()) {
			return matchingPercentage + 100 / preferenceFields.length;
		}
		return matchingPercentage;
	}, 0);
}
async function createNotification(title, message, userId) {
	const notification = await prisma.notification.create({
		data: {
			title,
			message,
			userId,
		},
	});

	return notification;
}
module.exports = user;
