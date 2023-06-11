(async function (settings) {
    settings.defaultSettings = {
        ENV: 'development'
    }
    settings.userSettings = async () => await chrome.storage.local.get('userSettings');
    settings.get = async () => {
        const { userSettings } = await this.settings.userSettings();
        let settings = {
            ...this.settings.defaultSettings,
            ...userSettings,
        }
        return settings;
    }
    settings.update = async (update) => {
        const { userSettings } = await settings.userSettings();
        const updatedSettings = {
            ...userSettings,
            ...update,
        }
        await chrome.storage.local.set({ userSettings: updatedSettings });
        Object.entries(await settings.get()).forEach((kv) => settings[kv[0]] = kv[1]);
    }
    Object.entries(await settings.get()).forEach((kv) => settings[kv[0]] = kv[1]);
})(typeof module !== 'undefined' && module.exports ? module.exports : (self.settings = self.settings || {}));