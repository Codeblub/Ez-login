/**
 * Ez-Login Authentication Bridge
 * Handles Cloud-Sync via GitHub Database (ipp.qqf3)
 */

// REPLACE 'Codeblub' with your exact GitHub username if different
const DB_URL = "https://raw.githubusercontent.com/Codeblub/Ez-login/main/ipp.qqf3";

/**
 * handleLogin
 * Fetches the encrypted database from GitHub and attempts decryption
 */
async function handleLogin(user, pass) {
    try {
        // Add a nocache parameter to ensure we get the latest users from GitHub
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        if (!response.ok) throw new Error("Could not connect to GitHub Database");
        
        const db = await response.json();
        
        // Find the user in the ipp.qqf3 JSON
        const userData = db.users[user];
        if (!userData) {
            console.error("User not found in database");
            return { success: false };
        }

        // Use the security.js engine to decrypt the "verified" tag
        const decrypted = await Security.decrypt(userData.content, userData.iv, pass);

        if (decrypted === "verified") {
            return {
                success: true,
                username: user,
                pfp: userData.pfp || `https://github.com/${user}.png`,
                apps: userData.apps || ["Android Sync", "C++ Engine", "Web App"]
            };
        } else {
            console.error("Decryption failed: Incorrect password");
        }
    } catch (error) {
        console.error("Auth Error:", error);
    }
    return { success: false };
}

/**
 * handleWidgetLogin
 * Specifically for sync.html (iframes/popups)
 */
async function handleWidgetLogin(user, pass, appTitle) {
    const res = await handleLogin(user, pass);
    if (res.success) {
        const messageData = {
            type: 'EZ_LOGIN_SUCCESS',
            user: user,
            app: appTitle
        };

        // Send signal to Parent App (e.g., Bmail)
        if (window.opener) {
            window.opener.postMessage(messageData, "*"); 
        } else if (window.parent !== window) {
            window.parent.postMessage(messageData, "*");
        }
        return true;
    }
    return false;
}

/**
 * handleSignup (Legacy/Local)
 * Note: For Cloud Sync, use the GitHub Action 'Add Ez-Login User'
 */
async function handleSignup(user, pass) {
    // This still works for local testing but won't sync across profiles
    const encrypted = await Security.encrypt("verified", pass);
    localStorage.setItem(`user_${user}`, JSON.stringify(encrypted));
    return { success: true };
}