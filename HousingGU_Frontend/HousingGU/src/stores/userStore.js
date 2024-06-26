import { defineStore } from "pinia";
import { watch, ref } from "vue";
import axios from "axios";
const userCred = "userCred";
export const userStore = defineStore("userStore", () => {
	const userName = ref("Sign In");
	const userId = ref("");
	const isAdmin = ref(false);
	const loggedIn = ref(false);
	const email = ref("");
	const phoneNumber = ref("");
	const token = ref("");
	const profilePicture = ref("");
	const IsPreferenceFilled = ref(false);
	const type = ref("");
	const notifications = ref([]);
	//const ImageURL = "http://localhost:5555/";
	const ImageURL = "http://89.116.167.130:5555/";
	setUserFromStorage();

	function setUserInfo(name, isAdminBool, givenEmail, phone, JWTtoken, givenProfilePicturePath, givenUserId, PreferenceFilled, givenType) {
		let checkUserInfo = localStorage.getItem(userCred);
		if (checkUserInfo === null || checkUserInfo === undefined || checkUserInfo === "null") {
			userName.value = name;
			userId.value = givenUserId;
			email.value = givenEmail;
			isAdmin.value = isAdminBool;
			loggedIn.value = true;
			phoneNumber.value = phone;
			token.value = JWTtoken;
			profilePicture.value = givenProfilePicturePath;
			IsPreferenceFilled.value = PreferenceFilled;
			type.value = givenType;
			axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
			localStorage.setItem(userCred, JSON.stringify(userInfo()));
		} else {
			let userInfoInStorage = JSON.parse(checkUserInfo); // TOdo check for Local Storage
		}
	}
	function setUserFromStorage() {
		//get user if logged in before refresh
		let checkUserInfo = localStorage.getItem(userCred);
		if (checkUserInfo === null || checkUserInfo === undefined || checkUserInfo === "null") {
			return;
		} else if (checkUserInfo != null) {
			let userInfoInStorage = JSON.parse(checkUserInfo);
			userName.value = userInfoInStorage.userName;
			userId.value = userInfoInStorage.userId;
			email.value = userInfoInStorage.email;
			isAdmin.value = userInfoInStorage.isAdmin;
			loggedIn.value = userInfoInStorage.loggedIn;
			phoneNumber.value = userInfoInStorage.phoneNumber;
			token.value = userInfoInStorage.token;
			profilePicture.value = userInfoInStorage.profilePicture;
			IsPreferenceFilled.value = userInfoInStorage.IsPreferenceFilled;
			type.value = userInfoInStorage.type;
			axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
		}
	}

	function logOutUser() {
		//const router = useRouter();
		//router.push("/"); // logout and go to main page
		localStorage.setItem(userCred, null);
		localStorage.removeItem(userCred);
		userName.value = "Sign In";
		userId.value = "";
		isAdmin.value = false;
		loggedIn.value = false;
		email.value = "";
		phoneNumber.value = "";
		token.value = "";
		profilePicture.value = "";
		IsPreferenceFilled.value = false;
		type.value = "";
		axios.defaults.headers.common["Authorization"] = `Bearer `;
	}

	function userInfo() {
		let userCred = {
			userName: userName.value,
			userId: userId.value,
			isAdmin: isAdmin.value,
			phoneNumber: phoneNumber.value,
			email: email.value,
			loggedIn: loggedIn.value,
			token: token.value,
			profilePicture: profilePicture.value,
			IsPreferenceFilled: IsPreferenceFilled.value,
			type: type.value,
		};
		return userCred;
	}

	async function loadNotifications() {
		try {
			const response = await axios.get("/user/getNotifications", {
				withCredentials: true,
			});
			//	console.log(response.data);
			if (response.data.notifications != null) {
				notifications.value = response.data.notifications;
				return response.data;
			}
		} catch (error) {
			console.error("Error loading notifications:", error);
		}
	}
	async function loadPreferences() {
		try {
			const response = await axios.get(`/user/getPreferences`, {
				withCredentials: true,
			});
			if (response.data.success) {
				return {
					success: true,
					preferences: response.data.preferences,
				};
			} else {
				return {
					success: false,
					message: response.data.message,
				};
			}
		} catch (error) {
			console.error("Error loading preferences:", error);
			return {
				success: false,
				message: "Error loading preferences",
			};
		}
	}
	return { userName, userId, isAdmin, loggedIn, email, phoneNumber, token, profilePicture, IsPreferenceFilled, type, setUserInfo, setUserFromStorage, logOutUser, userInfo, loadNotifications, notifications, loadPreferences, ImageURL };
});
