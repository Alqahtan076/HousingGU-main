<template>
	<div class="page-container">
		<div class="container-fluid">
			<div class="row">
				<div class="col-md-4 mt-3">
					<div class="card">
						<img :src="profileImgURL" alt="Profile Picture" class="card-img-top" />
						<div class="card-body">
							<h5 class="card-title">{{ userInfo.userName }}</h5>
							<button class="btn btn-primary" @click="editProfile">Edit Profile</button>
						</div>
					</div>
				</div>
				<div class="col-md-8 mt-3 mb-2">
					<div class="card flex-grow mb-3">
						<div class="card-body">
							<h5 class="card-title">About</h5>
							<p class="card-text">{{ aboutMe }}</p>
						</div>
					</div>
					<div class="card">
						<div class="card-body">
							<h5 class="card-title">My Posts</h5>
							<div class="d-flex justify-content-end mb-1">
								<button class="btn btn-primary" @click="showAddPostModal = true">Add New Post</button>
							</div>
							<div class="posts-container" style="max-height: 400px; overflow: auto">
								<div v-for="(post, index) in posts" :key="index" class="card mb-2">
									<div class="row g-0">
										<div class="col-md-2">
											<img :src="userInfo.ImageURL + post.images[0]" alt="Post Image" class="img-fluid rounded-start" />
										</div>
										<div class="col-md-10">
											<div class="card-body">
												<h5 class="card-title">{{ post.name }}</h5>
												<div class="images-scroll-container"></div>
												<p class="card-text">
													<small class="text-muted">Location: {{ post.location }}</small>
												</p>
												<p class="card-text">
													<small class="text-muted">Price: {{ post.price }}</small>
												</p>
												<div class="images-container">
													<img v-for="(image, imgIndex) in post.images.slice(1)" :src="userInfo.ImageURL + image" alt="Post Image" class="img-fluid rounded-start small-img me-2" :key="imgIndex" />
												</div>
												<div class="d-flex justify-content-end">
													<button class="btn btn-primary btn-sm me-2" @click="showEditPostModal(post)">Edit</button>
													<button class="btn btn-danger btn-sm" @click="showDeletePostModal(post)">Delete</button>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row g-0 align-items-center" v-if="posts.length === 0">No Posts</div>
							</div>
						</div>
					</div>
					<div class="card mt-1 mb-1">
						<div class="card-body">
							<h5 class="card-title">potential tenants Requests</h5>
							<div class="friend-requests-container" style="max-height: 300px; overflow-y: auto">
								<div v-for="(request, index) in friendRequests" :key="index" class="card mb-2 friend-request-card">
									<div class="row g-0 align-items-center">
										<div class="col-md-4">
											<img :src="userInfo.ImageURL + 'uploads/profilePictures/' + request.image" alt="Friend Request" class="img-fluid rounded-start friend-request-image" />
										</div>
										<div class="col-md-8">
											<div class="card-body">
												<h6 class="card-title">{{ request.name }}</h6>
												<p class="card-text">{{ request.description }}</p>
												<div class="d-flex justify-content-between align-items-center">
													<div>
														<button class="btn btn-success btn-sm me-2" @click="acceptRequest(request)">Accept</button>
														<button class="btn btn-danger btn-sm" @click="ignoreRequest(request)">Ignore</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="list-group-item disabled" v-if="friendRequests.length === 0">No tenants requests</div>
						</div>
					</div>
					<div class="card friends-card flex-grow mb-3">
						<div class="card-body">
							<h5 class="card-title">potential tenants</h5>
							<div class="list-group" style="max-height: 400px; overflow: auto">
								<button v-for="friend in friends" :key="friend.id" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
									<img :src="userInfo.ImageURL + 'uploads/profilePictures/' + friend.user.profilePicture" alt="Friend Request" class="avatar" />
									{{ friend.user.username }}
									<div>
										<button class="btn btn-primary" @click="goToChat(friend.Chat.id)">Chat</button>
										<button class="btn btn-danger" @click="showRemoveFriendModal(friend)">Remove</button>
									</div>
								</button>
								<div class="list-group-item disabled" v-if="friends.length === 0">No potential tenants</div>
							</div>
						</div>
					</div>
				</div>
			</div>
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

	<!-- Delete Post Modal -->
	<div class="modal fade" :class="{ show: deletePostModalVisible, 'd-block': deletePostModalVisible }" @click.self="deletePostModalVisible = false" tabindex="-1" aria-labelledby="deletePostModal" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="deletePostModal">Delete Post</h5>
					<button type="button" class="btn-close" @click="deletePostModalVisible = false"></button>
				</div>
				<div class="modal-body">
					<p>Are you sure you want to delete this post?</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="deletePostModalVisible = false">Cancel</button>
					<button type="button" class="btn btn-danger" @click="confirmDeletePost">Delete</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" :class="{ show: editPostModalVisible, 'd-block': editPostModalVisible }" @click.self="editPostModalVisible = false" tabindex="-1" aria-labelledby="editPostModal" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="editPostModal">Edit Post</h5>
					<button type="button" class="btn-close" @click="editPostModalVisible = false"></button>
				</div>
				<div class="modal-body">
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
							<label for="photo1">Photo:</label>
							<input type="file" id="photo1" accept="image/*" @change="handleFileUpload" />
						</div>
					</form>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="editPostModalVisible = false">Cancel</button>
					<button type="button" class="btn btn-primary" @click="saveEditedPost">Save Changes</button>
				</div>
			</div>
		</div>
	</div>
	<div class="overlay" v-show="isEditOverlayOpen">
		<div class="overlay-content">
			<h2>Edit Profile</h2>
			<form>
				<div class="form-group">
					<label for="userName">Username</label>
					<input type="text" class="form-control" id="userName" v-model="editedProfile.userName" />
				</div>
				<div class="form-group">
					<label for="aboutMe">About Me</label>
					<textarea class="form-control" id="aboutMe" rows="3" v-model="editedProfile.aboutMe"></textarea>
				</div>
				<div class="form-group">
					<label for="desc">Description</label>
					<textarea class="form-control" id="desc" rows="3" v-model="editedProfile.desc"></textarea>
				</div>
				<div class="form-group">
					<label for="photo1">Photo 1:</label>
					<input type="file" id="photo1" accept="image/*" @change="handleFileUpload" />
				</div>

				<div class="overlay-buttons">
					<button type="button" class="btn btn-secondary" @click="closeEditOverlay">Cancel</button>
					<button type="button" class="btn btn-primary" @click="saveProfileChanges">Save Changes</button>
				</div>
			</form>
		</div>
	</div>
	<div class="overlay" v-if="removeFriendModal.show">
		<div class="overlay-content">
			<div class="modal-header">
				<h5 class="modal-title">Remove Friend</h5>
				<button type="button" class="close" @click="closeRemoveFriendModal">&times;</button>
			</div>
			<div class="modal-body">
				<p>Are you sure you want to remove {{ removeFriendModal.friend.user.username }} from your friends list?</p>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" @click="closeRemoveFriendModal">Cancel</button>
				<button type="button" class="btn btn-danger" @click="removeFriend">Remove</button>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted } from "vue";
	import { userStore } from "../stores/userStore";
	import { useRouter } from "vue-router";
	import { toast } from "vue3-toastify";
	import axios from "axios";
	const isEditOverlayOpen = ref(false);
	const friends = ref([]);
	const userInfo = userStore();
	const router = useRouter();
	const aboutMe = ref("");
	const editedProfile = ref({
		userName: "",
		desc: "",
		aboutMe: "",
	});
	const showAddPostModal = ref(false);
	const deletePostModalVisible = ref(false);
	const editPostModalVisible = ref(false);
	const newPost = ref({
		name: "",
		fullDescription: "",
		location: "",
		price: "",
		images: [],
	});
	const postToDelete = ref(null);
	const postToEdit = ref(null);
	const friendRequests = ref([]);
	const removeFriendModal = ref({
		show: false,
		friend: null,
	});
	const profileImgURL = ref("");

	const posts = ref([
		{
			name: "Product 1",
			location: "New York, NY",
			price: "$19.99",
			images: ["https://via.placeholder.com/350x200"],
		},
	]);

	onMounted(async () => {
		loadLandlordProfile();
		loadFriendRequests();
	});

	async function loadLandlordProfile() {
		await axios
			.get("/user/myprofile/" + userInfo.userId, { withCredentials: true })
			.then((response) => {
				const user = response.data.user;
				userInfo.profilePicture = user.profilePicture;
				friends.value = response.data.chats;
				aboutMe.value = user.aboutMe;
			})
			.catch(function (error) {
				if (error.response && error.response.status === 401) {
					handleStatus401(error);
				}
			});

		axios
			.get(`/user/getAllPosts/${userInfo.userId}`)
			.then((response) => {
				posts.value = response.data;
				console.log("Posts:", response.data);
			})
			.catch((error) => {
				console.error("Error fetching posts:", error);
			});
		profileImgURL.value = userInfo.ImageURL + `uploads/profilePictures/` + userInfo.profilePicture;
	}

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
	function showEditPostModal(post) {
		postToEdit.value = { ...post };
		newPost.value = { ...post };
		editPostModalVisible.value = true;
	}

	async function saveEditedPost() {
		const formData = new FormData();

		// Append each field of the edited post
		formData.append("name", newPost.value.name);
		formData.append("fullDescription", newPost.value.fullDescription);
		formData.append("location", newPost.value.location);
		formData.append("price", newPost.value.price);
		formData.append("id", postToEdit.value.id);

		// Append each image file from newPost.value.images
		for (const file of newPost.value.images) {
			formData.append("images", file);
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
				const response = await axios.post(`/user/editPost`, formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
					withCredentials: true,
				});
				toast.success("Post updated successfully", {
					position: toast.POSITION.BOTTOM_RIGHT,
					theme: "colored",
				});
				loadLandlordProfile();
			} catch (error) {
				console.error("Error updating post:", error);
			} finally {
				editPostModalVisible.value = false;
			}
		}
	}

	function showDeletePostModal(post) {
		postToDelete.value = post;
		deletePostModalVisible.value = true;
	}

	async function confirmDeletePost() {
		try {
			await axios.delete(`/user/deletePost/${postToDelete.value.id}`, {
				withCredentials: true,
			});
			toast.success("Post deleted successfully", {
				position: toast.POSITION.BOTTOM_RIGHT,
				theme: "colored",
			});
			loadLandlordProfile();
		} catch (error) {
			console.error("Error deleting post:", error);
		} finally {
			deletePostModalVisible.value = false;
		}
	}

	async function loadFriendRequests() {
		await axios
			.get("/user/getMatchRequests", { withCredentials: true })
			.then((response) => {
				friendRequests.value = response.data.matching;
			})
			.catch(function (error) {
				if (error.response && error.response.status === 401) {
					handleStatus401(error);
				}
			});
	}

	const acceptRequest = async (request) => {
		try {
			const response = await axios
				.post("user/acceptMatchRequest", request, {
					withCredentials: true,
				})
				.then(function (response) {
					toast.success(response.data.message, {
						position: toast.POSITION.BOTTOM_RIGHT,
						theme: "colored",
					});
					loadLandlordProfile();
					loadFriendRequests();
				});
		} catch (error) {
			console.error("Error accepting request:", error);
		}
	};

	const ignoreRequest = async (request) => {
		try {
			const response = await axios
				.post("user/rejectMatchRequest", request, {
					withCredentials: true,
				})
				.then(function (response) {
					toast.success(response.data.message, {
						position: toast.POSITION.BOTTOM_RIGHT,
						theme: "colored",
					});
					loadLandlordProfile();
					loadFriendRequests();
				});
		} catch (error) {
			console.error("Error ignoring request:", error);
		}
	};

	function handleStatus401(response) {
		const userInfo = userStore();
		userInfo.logOutUser();
		router.push("/");
	}
	function editProfile() {
		editedProfile.value.userName = userInfo.userName;
		editedProfile.value.aboutMe = aboutMe.value;
		editedProfile.value.photos = ["../assets/img/photo1.jpg", "../assets/img/photo2.jpg", "../assets/img/photo3.jpg"];
		openEditOverlay();
	}

	function openEditOverlay() {
		isEditOverlayOpen.value = true;
	}

	function closeEditOverlay() {
		isEditOverlayOpen.value = false;
	}
	async function saveProfileChanges() {
		const formData = new FormData();
		formData.append("userName", editedProfile.value.userName);
		formData.append("aboutMe", editedProfile.value.aboutMe);
		formData.append("desc", editedProfile.value.desc);
		formData.append("photo", editedProfile.value.photos[0]);
		try {
			const response = await axios
				.post("user/editProfile", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
					withCredentials: true,
				})
				.then(function (response) {
					toast.success(response.data.message, {
						position: toast.POSITION.BOTTOM_RIGHT,
						theme: "colored",
					});
					closeEditOverlay();
				});
		} catch (error) {
			console.error("Error saving profile changes:", error);
		}
	}
	const goToChat = (friendId) => {
		router.push(`/chat/${friendId}`);
	};

	const showRemoveFriendModal = (friend) => {
		removeFriendModal.value.show = true;
		removeFriendModal.value.friend = friend;
	};

	const closeRemoveFriendModal = () => {
		removeFriendModal.value.show = false;
		removeFriendModal.value.friend = null;
	};

	const removeFriend = async () => {
		try {
			console.log("Removing friend:", removeFriendModal.value.friend);
			const response = await axios
				.post("user/removeFriend", removeFriendModal.value.friend, {
					withCredentials: true,
				})
				.then(function (response) {
					toast.success(response.data.message, {
						position: toast.POSITION.BOTTOM_RIGHT,
						theme: "colored",
					});
					loadMyProfile();
					loadFriendRequests();
				});
		} catch (error) {
			console.error("Error saving profile changes:", error);
		}
		closeRemoveFriendModal();
	};

	//helper method return and list all the validations of error when adding new post
	function handleErrors(errors) {
		let errorMessage = "Errors occurred:\n\n";
		errors.forEach((error, index) => {
			errorMessage += `${index + 1}. ${error}\n`;
		});

		return errorMessage;
	}
</script>
<style scoped>
	.page-container {
		height: 100vh;
		background-color: rgba(213, 169, 248, 0.233);
	}

	.container-fluid {
		margin-top: 4.7rem;
		margin-bottom: 1rem;
		max-height: 97vh;
		overflow-y: scroll;
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

	.card {
		margin-bottom: 1rem;
	}

	.friend-request-card {
		display: flex;
		padding: 0.9rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		margin-bottom: 15px;
	}
	.friends-card {
		max-height: 20rem;
		overflow-y: scroll;
	}
	.friend-request-image {
		width: 5rem;
		margin-right: 15px;
		border-radius: 50%;
	}

	.friend-request-details {
		flex-grow: 1;
	}

	.friend-requests-container {
		max-height: 16rem;
		overflow-y: auto;
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

		.overlay-content {
			max-width: 90%;
		}
	}
	.avatar {
		vertical-align: middle;
		width: 50px;
		height: 50px;
		border-radius: 50%;
	}
	.images-scroll-container {
		overflow-x: auto;
		white-space: nowrap;
		margin-top: 10px;
	}

	.images-container {
		display: inline-block;
	}

	.small-img {
		width: 2rem;
		height: auto;
		margin-top: 0.3rem;
		cursor: pointer;
	}
</style>
