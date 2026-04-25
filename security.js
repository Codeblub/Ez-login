const Security = {
    async deriveKey(password) {
        const encoder = new TextEncoder();
        const baseKey = await crypto.subtle.importKey(
            "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: encoder.encode("ez-login-salt"), iterations: 100000, hash: "SHA-256" },
            baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
        );
    },
    async encrypt(text, password) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await this.deriveKey(password);
        const encoded = new TextEncoder().encode(text);
        const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
        return {
            content: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
            iv: btoa(String.fromCharCode(...iv))
        };
    },
    async decrypt(content, iv, password) {
        try {
            const key = await this.deriveKey(password);
            const ivArr = new Uint8Array(atob(iv).split("").map(c => c.charCodeAt(0)));
            const data = new Uint8Array(atob(content).split("").map(c => c.charCodeAt(0)));
            const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivArr }, key, data);
            return new TextDecoder().decode(decrypted);
        } catch (e) { return null; }
    }
};