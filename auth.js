async function handleSignup(user, pass) {
    const encrypted = await Security.encrypt("verified", pass);
    localStorage.setItem(`user_${user}`, JSON.stringify(encrypted));
    return { success: true };
}

async function handleLogin(user, pass) {
    const stored = localStorage.getItem(`user_${user}`);
    if (!stored) return { success: false };
    const { content, iv } = JSON.parse(stored);
    const decrypted = await Security.decrypt(content, iv, pass);
    if (decrypted === "verified") {
        return { 
            success: true, 
            username: user, 
            pfp: `https://github.com/${user}.png`,
            apps: ["Android Sync", "C++ Engine", "Web App"] 
        };
    }
    return { success: false };
}
// Add/Update this in auth.js
async function handleWidgetLogin(user, pass, appTitle) {
    const res = await handleLogin(user, pass);
    if (res.success) {
        const messageData = {
            type: 'EZ_LOGIN_SUCCESS',
            user: user,
            app: appTitle
        };

        // 1. Check for Popup
        if (window.opener) {
            window.opener.postMessage(messageData, "*"); 
        } 
        // 2. Check for Iframe
        else if (window.parent !== window) {
            window.parent.postMessage(messageData, "*");
        }
        return true;
    }
    return false;
}