import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "../views/LandingPage.vue";
import login from "../views/login.vue";
import register from "../views/register.vue";
import roomatePreference from "../views/roomatePreference.vue";
import Profile from "../views/Profile.vue";
import LandLordProfile from "../views/LandLordProfile.vue"; // Import the LandLordProfile.vue component
import { userStore } from "../stores/userStore";
import Chat from "../views/chat.vue";
import roomieSearch from "../views/roomieSearch.vue";
import rooms from "../views/Rooms.vue";
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/:catchAll(.*)",
			name: "landingPage",
			component: LandingPage,
		},
		{
			path: "/login",
			name: "login",
			meta: { guest: true },
			component: login,
		},
		{
			path: "/register",
			name: "register",
			meta: { guest: true },
			component: register,
		},
		{
			path: "/roomatePreference",
			name: "roomatePreference",
			meta: { guest: false },
			component: roomatePreference,
		},
		{
			path: "/profile",
			name: "Profile",
			meta: { guest: false },
			component: Profile,
		},
		{
			path: "/landlord-profile",
			name: "LandLordProfile",
			meta: { guest: false },
			component: LandLordProfile,
		},
		{
			path: "/chat/:chatId",
			name: "Chat",
			meta: { guest: false },
			component: Chat,
		},
		{
			path: "/roomieSearch",
			name: "roomieSearch",
			meta: { guest: false },
			component: roomieSearch,
		},
		{
			path: "/rooms",
			name: "rooms",
			meta: { guest: false },
			component: rooms,
		},
	],
});

router.beforeEach((to, from, next) => {
	if (to.meta.guest == false) {
		const userInfo = userStore();
		if (!userInfo.loggedIn) {
			return next({ path: "/" }); // Redirect to the landing page if not logged in
		} else {
			// Check the user type and redirect accordingly
			if (to.name === "LandLordProfile" && userInfo.type === "Roomie") {
				return next({ name: "Profile" }); // Redirect Roomie users to the Profile page
			} else if (to.name === "Profile" && userInfo.type === "Landlord") {
				return next({ name: "LandLordProfile" }); // Redirect Landlord users to the LandLordProfile page
			} else {
				return next();
			}
		}
	} else {
		return next();
	}
});

export default router;
