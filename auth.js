const DB_URL = "https://raw.githubusercontent.com/Codeblub/Ez-login/main/ipp.qqf3";

async function handleLogin(user, pass) {
    try {
        // Fetch fresh data from GitHub
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const db = await response.json();
        
        const userData = db.users[user];
        if (!userData) return { success: false };

        // Security.decrypt will handle the combined content + tag
        const decrypted = await Security.decrypt(userData.content, userData.iv, pass);

        if (decrypted === "verified") {
            return {
                success: true,
                username: user,
                pfp: userData.pfp,
                apps: userData.apps
            };
        }
    } catch (e) {
        console.error("Auth error:", e);
    }
    return { success: false };
}