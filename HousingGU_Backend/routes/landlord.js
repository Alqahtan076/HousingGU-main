const express = require("express");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const landlord = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads/postImages");
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

landlord.post(
	"/user/createApartmentPost",
	upload.single("photo"),
	async (req, res, next) => {
		const { name, smallDescription, fullDescription, location, price } = req.body;
		let photo = null;

		if (!name || !smallDescription || !fullDescription || !location || !price) {
			if (req.file) {
				fs.unlink(`uploads/postimages/${req.file.filename}`, (err) => {
					if (err) {
						console.error("Error deleting file:", err);
					}
				});
			}
			return res.status(400).json({ response: "error", errorMessage: "All fields are required" });
		}

		// Handle the case when no file is uploaded
		if (!req.file) {
			return res.status(400).json({ response: "error", errorMessage: "No file uploaded" });
		}

		photo = req.file.filename;

		// Validate length constraints
		const nameMinLength = 3;
		const nameMaxLength = 50;
		const descriptionMinLength = 10;
		const descriptionMaxLength = 180;
		const locationMinLength = 3;
		const locationMaxLength = 180;
		const priceMinLength = 3;
		const priceMaxLength = 20;

		console.log("Name length:", name.length);
		console.log("Small Description length:", smallDescription.length);
		console.log("Full Description length:", fullDescription.length);
		console.log("Location length:", location.length);
		console.log("Price length:", price.length);

		const lengthErrors = [];

		if (name.length < nameMinLength || name.length > nameMaxLength) {
			lengthErrors.push(`Name must be between ${nameMinLength} and ${nameMaxLength} characters`);
		}

		if (smallDescription.length < descriptionMinLength || smallDescription.length > descriptionMaxLength) {
			lengthErrors.push(`Small Description must be between ${descriptionMinLength} and ${descriptionMaxLength} characters`);
		}

		if (fullDescription.length < descriptionMinLength || fullDescription.length > descriptionMaxLength) {
			lengthErrors.push(`Full Description must be between ${descriptionMinLength} and ${descriptionMaxLength} characters`);
		}

		if (location.length < locationMinLength || location.length > locationMaxLength) {
			lengthErrors.push(`Location must be between ${locationMinLength} and ${locationMaxLength} characters`);
		}

		if (price.length < priceMinLength || price.length > priceMaxLength) {
			lengthErrors.push(`Price must be between ${priceMinLength} and ${priceMaxLength} characters`);
		}

		if (lengthErrors.length > 0) {
			fs.unlink(`uploads/postimages/${req.file.filename}`, (err) => {
				if (err) {
					console.error("Error deleting file:", err);
				}
			});
			return res.status(400).json({ errors: lengthErrors });
		}

		if (!req.user || !req.user.id) {
			fs.unlink(`uploads/postimages/${req.file.filename}`, (err) => {
				if (err) {
					console.error("Error deleting file:", err);
				}
			});
			return res.status(401).json({ response: "error", errorMessage: "Unauthorized" });
		}

		try {
			const newApartment = await prisma.apartment.create({
				data: {
					name,
					image: photo,
					smallDescription,
					fullDescription,
					location,
					price,
					user: { connect: { id: req.user.id } },
				},
			});
			await createNotification("New Post!", "You have created a New Post! with the name: " + name, req.user.id);
			res.status(200).json({ message: "Apartment created successfully", apartment: newApartment });
		} catch (error) {
			console.error(error);
			res.status(500).json({ response: "error", errorMessage: "An error occurred while creating the apartment" });
		}
	},
	(err, req, res, next) => {
		if (err instanceof multer.MulterError) {
			console.error("Multer Error:", err);
			return res.status(400).json({ response: "error", errorMessage: err.message });
		} else if (err) {
			console.error("Unknown Error:", err);
			return res.status(500).json({ response: "error", errorMessage: "Internal Server Error" });
		}
	}
);

landlord.delete("/user/deletePost/:postId", async (req, res) => {
	try {
		const post = await prisma.apartment.findUnique({
			where: {
				id: req.params.postId,
			},
			select: {
				userId: true,
			},
		});

		if (!post) {
			return res.status(404).json({ errorMessage: "Post not found" });
		}

		if (post.userId !== req.user.id) {
			return res.status(403).json({ errorMessage: "Unauthorized: You are not the owner of this post" });
		}

		await prisma.apartment.delete({
			where: {
				id: req.params.postId,
			},
		});
		res.status(200).json({ errorMessage: "Post deleted successfully" });
	} catch (error) {
		console.error("Error deleting post:", error);
		res.status(500).json({ error: "An error occurred while deleting the post" });
	}
});

landlord.get("/user/getAllPosts/:userId", async (req, res) => {
	const userId = req.params.userId;
	try {
		const apartments = await prisma.apartment.findMany({
			where: {
				userId: userId,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});
		res.status(200).json(apartments);
	} catch (error) {
		console.error("Error fetching apartments:", error);
		res.status(500).json({ errorMessage: "An error occurred while fetching apartments" });
	}
});

landlord.post("/user/editPost", upload.single("image"), async (req, res) => {
	try {
		const postId = req.body.id;
		const { name, smallDescription, fullDescription, location, price } = req.body;
		const lengthErrors = [];
		// Validate length constraints
		const nameMinLength = 3;
		const nameMaxLength = 50;
		const descriptionMinLength = 10;
		const descriptionMaxLength = 180;
		const locationMinLength = 3;
		const locationMaxLength = 180;
		const priceMinLength = 3;
		const priceMaxLength = 20;
		if (name.length < nameMinLength || name.length > nameMaxLength) {
			lengthErrors.push(`Name must be between ${nameMinLength} and ${nameMaxLength} characters`);
		}

		if (smallDescription.length < descriptionMinLength || smallDescription.length > descriptionMaxLength) {
			lengthErrors.push(`Small Description must be between ${descriptionMinLength} and ${descriptionMaxLength} characters`);
		}

		if (fullDescription.length < descriptionMinLength || fullDescription.length > descriptionMaxLength) {
			lengthErrors.push(`Full Description must be between ${descriptionMinLength} and ${descriptionMaxLength} characters`);
		}

		if (location.length < locationMinLength || location.length > locationMaxLength) {
			lengthErrors.push(`Location must be between ${locationMinLength} and ${locationMaxLength} characters`);
		}

		if (price.length < priceMinLength || price.length > priceMaxLength) {
			lengthErrors.push(`Price must be between ${priceMinLength} and ${priceMaxLength} characters`);
		}

		if (lengthErrors.length > 0) {
			if (!name || !smallDescription || !fullDescription || !location || !price) {
				if (req.file) {
					fs.unlink(`uploads/postimages/${req.file.filename}`, (err) => {
						if (err) {
							console.error("Error deleting file:", err);
						}
					});
				}
				return res.status(400).json({ response: "error", errorMessage: "All fields are required" });
			}

			// Handle the case when no file is uploaded
			if (!req.file) {
				return res.status(400).json({ response: "error", errorMessage: "No file uploaded" });
			}
			fs.unlink(`uploads/postimages/${req.file.filename}`, (err) => {
				if (err) {
					console.error("Error deleting file:", err);
				}
			});
			return res.status(400).json({ errors: lengthErrors });
		}
		if (!req.file) {
			const updatedPost = await prisma.apartment.update({
				where: { id: postId },
				data: {
					name,
					smallDescription,
					fullDescription,
					location,
					price,
				},
			});
			res.status(200).json({ message: "Post updated successfully", updatedPost });
		} else {
			const updatedPost = await prisma.apartment.update({
				where: { id: postId },
				data: {
					name,
					smallDescription,
					fullDescription,
					location,
					price,
					image: req.file.filename,
				},
			});
			res.status(200).json({ message: "Post updated successfully", updatedPost });
		}
	} catch (error) {
		console.error("Error updating post:", error);
		res.status(500).json({ error: "An error occurred while updating the post" });
	}
});

landlord.get("/user/getAllPosts", async (req, res) => {
	try {
		const apartments = await prisma.apartment.findMany({
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});
		res.status(200).json(apartments);
	} catch (error) {
		console.error("Error fetching apartments:", error);
		res.status(500).json({ error: "An error occurred while fetching apartments" });
	}
});

landlord.post("/user/createMatchRequest", async (req, res) => {
	try {
		const existingRequest = await prisma.matched.findFirst({
			where: {
				MatchRequestedBy: req.body.MatchRequestedBy,
				MatchRequestTo: req.body.MatchRequestTo,
			},
		});
		if (existingRequest) {
			if (existingRequest.ApprovedRequest == true || (existingRequest.ApprovedRequest == false && existingRequest.RejectedRequest == false)) {
				return res.status(409).json({ error: "A chat request has already been sent by the user" });
			}
		}

		const newMatchRequest = await prisma.matched.create({
			data: {
				MatchRequestedBy: req.body.MatchRequestedBy,
				RequestedByName: req.body.RequestedByName,
				RequestedToName: req.body.RequestedToName,
				RequestedByMatchPercentage: req.body.RequestedByMatchPercentage,
				MatchRequestTo: req.body.MatchRequestTo,
				ApprovedRequest: false,
				RejectedRequest: false,
			},
		});
		await createNotification("Match Request", "You have a match request pending from  " + newMatchRequest.RequestedByName, newMatchRequest.MatchRequestTo);
		res.status(201).json({ message: "Match request created successfully", matchRequest: newMatchRequest });
	} catch (error) {
		console.error("Error creating match request:", error);
		res.status(500).json({ error: "An error occurred while creating the match request" });
	}
});
landlord.get("/landingPagePosts", async (req, res) => {
	try {
		const apartments = await prisma.apartment.findMany({
			take: 12, // Limit to the first 12 posts
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});
		res.status(200).json(apartments);
	} catch (error) {
		console.error("Error fetching apartments:", error);
		res.status(500).json({ error: "An error occurred while fetching apartments" });
	}
});

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
module.exports = landlord;
