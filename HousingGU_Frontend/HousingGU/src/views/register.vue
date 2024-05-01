<template>
	<div class="register-page">
		<div class="register-container">
			<div class="register-form">
				<form :class="{ 'slide-in': formVisible }">
					<img src="../assets/img/logo.png" alt="Logo" class="LogoImg" />
					<h2>Create New Account</h2>
					<div class="mb-3">
						<label for="Username" class="form-label">Username</label>
						<input type="text" class="form-control" id="Username" placeholder="Enter your username" v-model="formUserName" @input="validateUserName" :class="{ 'is-invalid': !isUserNameValid }" />
						<div v-if="!isUserNameValid" class="invalid-feedback">Username is required.</div>
					</div>
					<div class="mb-3">
						<label class="form-label">User Type</label>
						<div>
							<label> <input type="radio" value="Roomie" v-model="selectedUser" /> Roomie </label>
							<label> <input type="radio" value="Landlord" v-model="selectedUser" /> Landlord </label>
						</div>
					</div>
					<div class="mb-3">
						<label for="email" class="form-label">Email</label>
						<input type="email" class="form-control" id="email" placeholder="Enter your email" v-model="formEmail" @input="validateEmail" :class="{ 'is-invalid': !isEmailValid }" />
						<div v-if="!isEmailValid" class="invalid-feedback">Please enter a valid email address.</div>
					</div>
					<div class="mb-3">
						<label for="phoneNumber" class="form-label">Phone Number</label>
						<input type="tel" class="form-control" id="phoneNumber" placeholder="1123456789" v-model="formPhone" @input="validatePhone" :class="{ 'is-invalid': !isPhoneValid }" />
						<div v-if="!isPhoneValid" class="invalid-feedback">Please enter a valid phone number.</div>
					</div>
					<div class="mb-3">
						<label for="password" class="form-label">Password</label>
						<div class="input-group">
							<input :type="passwordFieldType" class="form-control" id="password" placeholder="Enter your password" v-model="formPassword" @input="validatePassword" :class="{ 'is-invalid': !isPasswordValid }" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{:;'?/>.<,])(?=.*[a-zA-Z]).{8,12}" title="Password should contain at least one special character, one uppercase letter, one lowercase letter, and one number, and be 8-12 characters long" />
							<button class="btn btn-outline-secondary" type="button" @click="togglePasswordVisibility">
								<span v-if="passwordFieldType === 'password'">Show</span>
								<span v-else>Hide</span>
							</button>
						</div>
						<div v-if="!isPasswordValid" class="invalid-feedback">Password should contain at least one special character, one uppercase letter, one lowercase letter, and one number, and be 8-12 characters long.</div>
					</div>
					<div class="mb-3" v-if="selectedUser === 'Roomie'">
						<label for="age" class="form-label">Age</label>
						<input type="number" class="form-control" id="age" placeholder="Enter your age" v-model="formAge" @input="validateAge" :class="{ 'is-invalid': !isAgeValid }" min="18" max="100" />
						<div v-if="!isAgeValid" class="invalid-feedback">Age must be between 18 and 100.</div>
					</div>
					<div class="mb-3">
						<label for="gender" class="form-label">Gender</label>
						<select class="form-select" id="gender" v-model="formGender" @input="validateGender" :class="{ 'is-invalid': !isGenderValid }">
							<option value="Male">Male</option>
							<option value="Female">Female</option>
							<option value="Other">Other</option>
						</select>
						<div v-if="!isGenderValid" class="invalid-feedback">Gender is required.</div>
					</div>
					<div class="mb-3" v-if="false">
						<label for="city" class="form-label">City</label>
						<input type="text" class="form-control" id="city" placeholder="Enter your city" v-model="formCity" @input="validateCity" :class="{ 'is-invalid': !isCityValid }" />
						<div v-if="!isCityValid" class="invalid-feedback">City is required.</div>
					</div>
					<div class="mb-3" v-if="false">
						<label for="nationality" class="form-label">Nationality</label>
						<input type="text" class="form-control" id="nationality" placeholder="Enter your nationality" v-model="formNationality" @input="validateNationality" :class="{ 'is-invalid': !isNationalityValid }" />
						<div v-if="!isNationalityValid" class="invalid-feedback">Nationality is required.</div>
					</div>
					<div class="mb-3">
						<label for="profilePicture" class="form-label">Profile Picture</label>
						<input type="file" class="form-control" id="profilePicture" @change="handleFileUpload" accept="image/*" />
					</div>
					<div>
						<div class="mb-3">
							<label for="aboutMe" class="form-label">About Me</label>
							<textarea class="form-control" id="aboutMe" placeholder="Enter something about yourself" v-model="formAboutMe"></textarea>
						</div>
					</div>
					<button type="button" @click="register()" class="btn btn-primary">Register</button>
					<div class="text-center mt-3">
						<button type="button" class="btn btn-secondary btn-sm" @click="router.push({ path: '/login' })">You already have an account?</button>
					</div>
				</form>
			</div>
			<div class="dashboard">
				<img src="../assets/img/login.jpg" alt="Dashboard Image" class="sideImg" />
			</div>
		</div>
	</div>
</template>

<script setup>
	import axios from "axios";
	import { ref, onMounted } from "vue";
	import { toast } from "vue3-toastify";
	import "vue3-toastify/dist/index.css";
	import { useRouter, useRoute } from "vue-router";
	const passwordFieldType = ref("password");
	const route = useRoute();
	const router = useRouter();
	const formUserName = ref("");
	const formPassword = ref("");
	const formEmail = ref("");
	const formPhone = ref("");
	const formVisible = ref(false);
	const profilePicture = ref(null);
	const selectedUser = ref("Landlord");
	const formAboutMe = ref("");
	const formAge = ref("");
	const formGender = ref("Male");
	const isUserNameValid = ref(true);
	const isEmailValid = ref(true);
	const isPhoneValid = ref(true);

	const isPasswordValid = ref(true);
	const isAgeValid = ref(true);
	const isGenderValid = ref(true);
	const isCityValid = ref(true);
	const isNationalityValid = ref(true);

	onMounted(() => {
		formVisible.value = true;
	});

	async function register() {
		// Perform form validation
		if (!isUserNameValid.value || !isEmailValid.value || !isPhoneValid.value || !isPasswordValid.value || (selectedUser.value === "Roomie" && (!isAgeValid.value || !isGenderValid.value || !isCityValid.value || !isNationalityValid.value))) {
			toast.error("Please fill in all the required fields.", {
				position: toast.POSITION.BOTTOM_RIGHT,
				theme: "colored",
			});
			return;
		}

		const registerCred = new FormData();
		registerCred.append("username", formUserName.value);
		registerCred.append("email", formEmail.value);
		registerCred.append("password", formPassword.value);
		registerCred.append("phoneNumber", formPhone.value);
		registerCred.append("profilePicture", profilePicture.value);
		registerCred.append("type", selectedUser.value);
		registerCred.append("aboutMe", formAboutMe.value);

		// Append Roomie specific fields
		if (selectedUser.value === "Roomie") {
			registerCred.append("age", formAge.value);
			registerCred.append("gender", formGender.value);
		}

		await axios
			.post("/signup", registerCred, {
				withCredentials: true,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.then(function (response) {
				if (response.data.response == "ok") {
					toast.success("Account registered successfully", {
						position: toast.POSITION.BOTTOM_RIGHT,
						theme: "colored",
					});
					setTimeout(() => {
						router.push("/login");
					}, 2500);
				} else {
					if ((error.name = "AxiosError")) {
						toast.error(error.response.data, {
							position: toast.POSITION.BOTTOM_RIGHT,
							theme: "colored",
						});
					} else {
						toast.error(error.response.data.message, {
							position: toast.POSITION.BOTTOM_RIGHT,
							theme: "colored",
						});
					}
				}
			})
			.catch(function (error) {
				console.log(error.response.data);
				toast.error(error.response.data.errorMessage, {
					position: toast.POSITION.BOTTOM_RIGHT,
					theme: "colored",
				});
			});
	}

	function handleFileUpload(event) {
		const file = event.target.files[0];
		profilePicture.value = file;
	}

	function validateUserName() {
		isUserNameValid.value = !!formUserName.value;
		if (isUserNameValid.value) {
			isUserNameValid.value = true;
		}
	}

	function validateEmail() {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		isEmailValid.value = emailRegex.test(formEmail.value);
		if (isEmailValid.value) {
			isEmailValid.value = true;
		}
	}

	function validatePhone() {
		const phoneRegex = /^\d{10}$/;
		isPhoneValid.value = phoneRegex.test(formPhone.value);
		if (isPhoneValid.value) {
			isPhoneValid.value = true;
		}
	}

	function validatePassword() {
		const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{:;'?/>.<,])(?=.*[a-zA-Z]).{8,12}/;
		isPasswordValid.value = passwordRegex.test(formPassword.value);
		if (isPasswordValid.value) {
			isPasswordValid.value = true;
		}
	}

	function validateAge() {
		isAgeValid.value = formAge.value >= 18 && formAge.value <= 100;
		if (isAgeValid.value) {
			isAgeValid.value = true;
		}
	}

	function validateGender() {
		isGenderValid.value = !!formGender.value;
		if (isGenderValid.value) {
			isGenderValid.value = true;
		}
	}

	function validateCity() {
		isCityValid.value = !!formCity.value;
		if (isCityValid.value) {
			isCityValid.value = true;
		}
	}

	function validateNationality() {
		isNationalityValid.value = !!formNationality.value;
		if (isNationalityValid.value) {
			isNationalityValid.value = true;
		}
	}
	const togglePasswordVisibility = () => {
		passwordFieldType.value = passwordFieldType.value === "password" ? "text" : "password";
	};
</script>

<style scoped>
	/* Styles for invalid feedback */
	.is-invalid {
		border: 1px solid red !important;
	}

	.invalid-feedback {
		color: red;
		font-size: 0.875rem;
		display: block;
		width: 100%;
		margin-top: 0.25rem;
	}

	form {
		max-height: 85vh;
		width: 45vw;
		overflow-y: auto;
		margin-top: 3rem;
	}
	.LogoImg {
		width: 20vw;
		margin-top: 2rem;
	}
	.register-container {
		display: flex;
		height: 95vh;
		overflow-x: hidden;
		overflow-y: auto;
	}
	.register-container .register-form {
		flex: 0 0 50%;
		background: #f8f9fa;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 4rem;
	}

	.register-container .dashboard {
		background: #f8f9fa;
		flex: 0 0 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
	}
	.register-container .dashboard img {
		width: 100%;
		height: 100%;
		clip-path: polygon(21% 0, 100% 0, 79% 100%, 0% 100%);
	}

	.register-container .dashboard a {
		color: #fff;
		text-decoration: underline;
	}

	.slide-in {
		animation: slideInFromLeft 0.6s ease-in-out forwards;
	}

	::-webkit-scrollbar {
		width: 10px;
	}

	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	::-webkit-scrollbar-thumb {
		background: #888;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
	@keyframes slideInFromLeft {
		from {
			transform: translateX(-140%);
		}
		to {
			transform: translateX(0);
		}
	}
</style>
