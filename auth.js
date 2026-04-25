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