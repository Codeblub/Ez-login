class Security {
    static async deriveKey(password) {
        const encoder = new TextEncoder();
        const salt = encoder.encode("ez-login-salt");
        const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
        return crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );
    }

    static async decrypt(content, iv, password) {
        try {
            const key = await this.deriveKey(password);
            const ivArr = new Uint8Array(atob(iv).split("").map(c => c.charCodeAt(0)));
            const data = new Uint8Array(atob(content).split("").map(c => c.charCodeAt(0)));

            // Browser SubtleCrypto expects Auth Tag at the end of 'data'
            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: ivArr }, 
                key, 
                data
            );
            return new TextDecoder().decode(decrypted);
        } catch (e) { return null; }
    }
}