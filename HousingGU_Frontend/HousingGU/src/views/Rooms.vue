<template>
	<div class="container py-5">
		<div class="row">
			<div class="col-md-3">
				<div class="card mb-3">
					<button class="btn btn-primary" @click="showAddPostModal = true" v-if="userInfo.type == 'Landlord'">Add New Post</button>
					<div class="card-body">
						<h5 class="card-title">Search</h5>
						<input type="text" class="form-control mb-3" v-model="searchText" placeholder="Search by title, description..." />
					</div>
				</div>
				<div class="card mb-3">
					<div class="card-body">
						<h5 class="card-title">Price Range</h5>
						<div class="form-group">
							<label for="minPrice">Min Price</label>
							<input type="number" class="form-control" id="minPrice" v-model="minPrice" />
						</div>
						<div class="form-group">
							<label for="maxPrice">Max Price</label>
							<input type="number" class="form-control" id="maxPrice" v-model="maxPrice" />
						</div>
					</div>
				</div>
				<div class="card mb-3">
					<div class="card-body">
						<h5 class="card-title">Sort by Price</h5>
						<div class="form-group">
							<div class="form-check">
								<input class="form-check-input" type="radio" name="sortOrder" id="sortAsc" value="asc" v-model="sortOrder" />
								<label class="form-check-label" for="sortAsc">Low to high</label>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="sortOrder" id="sortDesc" value="desc" v-model="sortOrder" />
								<label class="form-check-label" for="sortDesc">High to low</label>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-9">
				<div class="row">
					<div v-for="post in paginatedPosts" :key="post.id" class="col-lg-4 col-md-6 col-sm-6 col-6 d-flex justify-content-center py-3">
						<div class="card text-light sp-card">
							<div class="position-relative">
								<img :src="userInfo.ImageURL + `${post.images[0]}`" class="card-img-top" alt="Room Image" />
								<div class="badges">
									<span class="badge bg-secondary">{{ post.location }}</span>
									<span class="badge bg-primary">{{ post.price }} per month</span>
								</div>
							</div>
							<div class="card-body d-flex flex-column justify-content-between align-items-start sp-bg-image-card">
								<div>
									<p class="card-title text-user-color">{{ post.user.username }}</p>
									<h3 class="card-title text-black-50 fs-5">{{ post.name }}</h3>
								</div>
								<div class="text-center">
									<div class="scrollable-description">
										<p class="card-text text-muted fs-6">{{ post.fullDescription }}</p>
									</div>

									<button class="btn btn-primary btn-sm mt-2" @click="openImageModal(post.images)">View Images</button>
									<button class="btn btn-primary btn-sm mt-2" v-if="userInfo.userId != post.userId" @click="createMatchRequest(post)">Create a chat request</button>
								</div>
							</div>
						</div>
					</div>
					<h2 style="text-align: center" v-if="posts.length === 0">No Rooms are posted</h2>
				</div>
			</div>
		</div>
		<div class="d-flex justify-content-center">
			<nav aria-label="Page navigation">
				<ul class="pagination">
					<li class="page-item" :class="{ disabled: currentPage === 1 }">
						<a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
					</li>
					<li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
						<a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
					</li>
					<li class="page-item" :class="{ disabled: currentPage === totalPages }">
						<a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
					</li>
				</ul>
			</nav>
		</div>
	</div>
	<div class="overlay" v-if="showAddPostModal == true">
		<div class="overlay-content">
			<h2>Add New Post</h2>
			<form>
				<div class="form-group">
					<label for="name">Name</label>
					<input type="text" class="form-control" id="name" v-model="newPost.name" />
				</div>

				<div class="form-group">
					<label for="fullDescription">Full Description</label>
					<textarea class="form-control" id="fullDescription" rows="3" v-model="newPost.fullDescription"></textarea>
				</div>
				<div class="form-group">
					<label for="location">Location</label>
					<input type="text" class="form-control" id="location" v-model="newPost.location" />
				</div>
				<div class="form-group">
					<label for="price">Price</label>
					<input type="text" class="form-control" id="price" v-model="newPost.price" />
				</div>
				<div class="form-group">
					<label for="photos">Photos:</label>
					<input type="file" id="photos" accept="image/*" multiple @change="handleMultipleFileUpload" />
				</div>

				<div class="overlay-buttons">
					<button type="button" class="btn btn-secondary" @click="showAddPostModal = false">Cancel</button>
					<button type="button" class="btn btn-primary" @click="savePost()">Save Post</button>
				</div>
			</form>
		</div>
	</div>
	<div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="imageModalLabel">Post Images</h5>
					<button type="button" class="btn-close" @click="closeImageModal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="images-container">
						<img v-for="image in modalImages" :key="image" :src="userInfo.ImageURL + `${image}`" class="modal-image" alt="Post Image" />
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="closeImageModal">Close</button>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
	import { ref, computed, onMounted } from "vue";
	import axios from "axios";
	import { userStore } from "../stores/userStore";
	import { toast } from "vue3-toastify";
	const posts = ref([]);
	const searchText = ref("");
	const minPrice = ref(null);
	const maxPrice = ref(null);
	const sortOrder = ref("asc");
	const currentPage = ref(1);
	const itemsPerPage = 6;
	const userInfo = userStore();
	const showAddPostModal = ref(false);
	const newPost = ref({
		name: "",
		fullDescription: "",
		location: "",
		price: "",
		images: [],
	});
	const fetchPosts = async () => {
		try {
			const response = await axios.get("/user/getAllPosts");
			//	console.log(response.data);
			posts.value = response.data;
		} catch (error) {
			console.error("Error fetching posts:", error);
		}
	};

	onMounted(fetchPosts);
	const modalImages = ref([]);

	const openImageModal = (images) => {
		modalImages.value = images;
		const modal = document.getElementById("imageModal");
		modal.classList.add("show");
		modal.style.display = "block";
		document.body.classList.add("modal-open");
	};

	const closeImageModal = () => {
		modalImages.value = [];
		const modal = document.getElementById("imageModal");
		modal.classList.remove("show");
		modal.style.display = "none";
		document.body.classList.remove("modal-open");
	};

	const filteredPosts = computed(() => {
		let filtered = posts.value.filter((post) => {
			const titleMatch = post.name.toLowerCase().includes(searchText.value.toLowerCase());
			const location = post.location.toLowerCase().includes(searchText.value.toLowerCase());
			const descriptionMatch = post.fullDescription.toLowerCase().includes(searchText.value.toLowerCase());
			const usernameMatch = post.user.username.toLowerCase().includes(searchText.value.toLowerCase());
			const priceMatch = (minPrice.value === null || post.price >= minPrice.value) && (maxPrice.value === null || post.price <= maxPrice.value);
			return (titleMatch || descriptionMatch || usernameMatch || location) && priceMatch;
		});

		if (sortOrder.value === "asc") {
			filtered = filtered.sort((a, b) => a.price - b.price);
		} else {
			filtered = filtered.sort((a, b) => b.price - a.price);
		}

		return filtered;
	});

	const paginatedPosts = computed(() => {
		const startIndex = (currentPage.value - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredPosts.value.slice(startIndex, endIndex);
	});

	const totalPages = computed(() => {
		return Math.ceil(filteredPosts.value.length / itemsPerPage);
	});

	const changePage = (page) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page;
		}
	};

	function handleMultipleFileUpload(event) {
		const files = event.target.files;

		newPost.value.images = [];

		for (let i = 0; i < files.length; i++) {
			newPost.value.images.push(files[i]);
		}
	}
	async function savePost() {
		const formData = new FormData();
		formData.append("name", newPost.value.name);
		formData.append("fullDescription", newPost.value.fullDescription);
		formData.append("location", newPost.value.location);
		formData.append("price", newPost.value.price);
		// Append each image file to the formData
		for (let i = 0; i < newPost.value.images.length; i++) {
			formData.append("photos", newPost.value.images[i]);
		}
		const price = parseInt(newPost.value.price);
		if (isNaN(price) || price !== parseFloat(newPost.value.price)) {
			toast.error("Price must be an integer", {
				position: toast.POSITION.BOTTOM_RIGHT,
				theme: "colored",
			});
			return;
		} else {
			try {
				const response = await axios
					.post("/user/createApartmentPost", formData, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
					})
					.then(function (response) {
						toast.success("Post Created successfully", {
							position: toast.POSITION.BOTTOM_RIGHT,
							theme: "colored",
						});
						setTimeout(() => {
							showAddPostModal.value = false;
						}, 1500);
					})
					.catch(function (error) {
						if (error.response.data.errors !== undefined) {
							toast.error(handleErrors(error.response.data.errors), {
								position: toast.POSITION.BOTTOM_RIGHT,
								theme: "colored",
								duration: 5000,
							});
						} else {
							toast.error(error.response.data.errorMessage, {
								position: toast.POSITION.BOTTOM_RIGHT,
								theme: "colored",
								duration: 5000,
							});
						}
					});
			} catch (error) {
				console.error(error);
				// Handle the error
			}
		}
	}

	const createMatchRequest = async (post) => {
		try {
			const response = await axios.post("/user/createMatchRequest", {
				MatchRequestedBy: userInfo.userId,
				RequestedByName: userInfo.userName,
				RequestedToName: post.user.username,
				RequestedByMatchPercentage: "100%",
				MatchRequestTo: post.userId,
			});
			toast.success("Match request sent successfully", {
				position: toast.POSITION.BOTTOM_RIGHT,
				theme: "colored",
			});
		} catch (error) {
			if (error.response && error.response.status === 409) {
				toast.error("chat request already exists", {
					position: toast.POSITION.BOTTOM_RIGHT,
					theme: "colored",
				});
			} else {
				console.error("Error sending match request:", error);
				toast.error("Failed to send match request", {
					position: toast.POSITION.BOTTOM_RIGHT,
					theme: "colored",
				});
			}
		}
	};
	function handleErrors(errors) {
		let errorMessage = "Errors occurred:\n\n";
		errors.forEach((error, index) => {
			errorMessage += `${index + 1}. ${error}\n`;
		});

		return errorMessage;
	}
</script>
<style scoped>
	.container {
		margin-top: 5em;
		margin-bottom: 2rem;
		height: 90vh;
		overflow-x: hidden;
		background-color: rgba(243, 241, 241, 0.233);
		border-top-left-radius: 2%;
		border-bottom-left-radius: 2%;
	}
	.text-user-color {
		color: #89cff0;
	}
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.overlay-content {
		background-color: #fff;
		padding: 20px;
		max-width: 500px;
		width: 100%;
	}

	.overlay-buttons {
		display: flex;
		justify-content: flex-end;
		margin-top: 20px;
	}

	@media (max-width: 767px) {
		.page-container {
			margin-top: 3.5rem;
			height: auto;
		}

		.container-fluid {
			padding: 0 1rem;
		}

		.col-12 {
			padding: 0;
		}

		.card {
			border-radius: 0;
			margin-top: 0.5rem;
			margin-bottom: 0.5rem;
		}

		.friend-requests-card,
		.friends-card {
			margin-top: 0.5rem;
		}

		.overlay-content {
			max-width: 90%;
		}
	}

	.modal {
		display: none;
		position: fixed;
		z-index: 1050;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.modal-dialog {
		position: relative;
		width: 80%;
		max-width: 800px;
		margin: auto;
		margin-top: 10vh;
	}

	.modal-content {
		position: relative;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 0.3rem;
		outline: 0;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 15px;
		border-bottom: 1px solid #dee2e6;
		border-top-left-radius: 0.3rem;
		border-top-right-radius: 0.3rem;
	}

	.modal-body {
		position: relative;
		flex: 1 1 auto;
		padding: 15px;
		overflow-y: auto;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		padding: 15px;
		border-top: 1px solid #dee2e6;
		border-bottom-right-radius: 0.3rem;
		border-bottom-left-radius: 0.3rem;
	}

	.images-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}

	.modal-image {
		max-width: 100%;
		height: auto;
	}
	.scrollable-description {
		max-height: 100px;
		overflow-y: auto;
	}
</style>
